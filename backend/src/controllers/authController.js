import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import { ROLES } from '../models/User.js';

const signAccessToken = (id) =>
    jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    })
const signRefreshToken = (id) =>
    jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    })
const sendTokens = (res, user, statusCode) => {
    const accessToken = signAccessToken(user._id)
    const refreshToken = signRefreshToken(user._id)

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    user.password = undefined;
    res.status(statusCode).json({
        success: true, accessToken, user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
    })
};

export const register = async (req, res) => {
    try {
        const { name, email, password, role, phone, companyName, address } = req.body;
        const requestedRole = role || 'customer';
        if (requestedRole === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin accounts cannot be self-registered. contact the system administrator'
            })
        }
        const validRoles = ['customer', 'sales', 'engineer', 'service_manager', 'store_manager']
        if (!validRoles.includes(requestedRole)) {
            return res.status(400).json({ success: false, message: `invalid role ${requestedRole}` })
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        // Staff roles start as inactive — admin must activate them
        // Customers can login immediately, others must be approved by admin
        const isActive = requestedRole === 'customer';
        const user = await User.create({ name, email, password, role: requestedRole, isActive })
        if (requestedRole === 'customer') {
            await Customer.create({ user: user._id, name, phone, companyName, address });
            return sendTokens(res, user, 201);
        }
        res.status(201).json({
            success: true,
            message: `Account created for role '${requestedRole}'. Pending admin approval. You will receive a confirmation email.`,
        })
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }
        // Explicitly select password — it's excluded by default (select: false in model)
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
        }
        // Check if account is activated by admin
        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Account deactivated. Contact admin.' });
        }
        // Update last login timestamp
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        sendTokens(res, user, 200);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed.', error: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            return res.status(401).json({ success: false, message: 'No refresh token found' })
        }
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        const user = await User.findById(decoded.id)
        // Check both user exists and is active
        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' })
        }
        const newAccessToken = signAccessToken(user._id)
        res.status(200).json({ success: true, accessToken: newAccessToken })
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }
}

export const logout = (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV == 'production',
        sameSite: 'strict'
    })
    res.status(200).json({ message: 'logge out successfully', success: true })
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        let customerProfile = null;
        if (user.role === 'customer') {
            customerProfile = await Customer.findOne({ user: user._id })
        }
        res.status(200).json({ success: true, user, customerProfile, })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getEngineers = async (req, res) => {
    try {
        const engineers = await User.find({ role: 'engineer', isActive: true })
            .select('_id name email role')
            .sort({ name: 1 })
        res.status(200).json({ success: true, count: engineers.length, engineers })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const adminTokenStore = new Map();
const generateAdminToken = () => {
    Math.random().toString(36).substring(2) + Date.now().toString(36)
}
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' })
        }
        if (!email.toLowerCase().endsWith('@sunce.admin.com')) {
            return res.status(403).json({ success: false, message: 'wrong email' })
        }
        const user = await User.findOne({ email }).select('+password')
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'This account does not have admin privileges.' });
        }
        // Check if admin account is activated
        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Account deactivated. Contact system administrator.' });
        }
        const token = generateAdminToken();
        adminTokenStore.set(token, {
            userId: user._id.toString(),
            expiresAt: Date.now() + 10 * 60 * 1000,
        });
        const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/admin-verify?token=${token}`
        console.log(`\n[ADMIN VERIFY LINK - send this via email in production]\n${verifyUrl}\n`);
        res.status(200).json({
            success: true,
            message: 'Verification link sent to your email',
            ...(process.env.NODE_ENV === 'development' && { devVerifyUrl: verifyUrl })
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const adminVerify = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Verification token is required.' });
        }

        const entry = adminTokenStore.get(token);
        if (!entry) {
            return res.status(400).json({ success: false, message: 'Invalid or already used verification link.' });
        }

        if (Date.now() > entry.expiresAt) {
            adminTokenStore.delete(token);
            return res.status(400).json({ success: false, message: 'Verification link has expired. Please log in again.' });
        }

        const user = await User.findById(entry.userId);
        if (!user || user.role !== 'admin') {
            return res.status(400).json({ success: false, message: 'Invalid verification request.' });
        }
        adminTokenStore.delete(token);

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // Issue tokens exactly like regular login
        sendTokens(res, user, 200);
    } catch (error) {
        res.status(500).json({ message: error.message, success: false })
    }
}

export const signup = async (req, res) => {
    try {
        const { name, email, password, role, phone, companyName, address } = req.body;
        const requestedRole = role || 'customer';
        if (requestedRole === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin accounts cannot be self-registered. contact the system administrator'
            })
        }
        const validRoles = ['customer', 'sales', 'engineer', 'service_manager', 'store_manager']
        if (!validRoles.includes(requestedRole)) {
            return res.status(400).json({ success: false, message: `invaid role ${requestedRole}` })
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        // Staff roles start as inactive — admin must activate them
        // Customers can login immediately, others must be approved by admin
        const isActive = requestedRole === 'customer';
        const user = await User.create({ name, email, password, role: requestedRole, isActive })
        if (requestedRole === 'customer') {
            await Customer.create({ user: user._id, name, phone, companyName, address });
            return sendTokens(res, user, 201);
        }
        res.status(201).json({
            success: true,
            message: `Account created for role '${requestedRole}'. Your account is pending admin approval. You will be notified once activated.`,
        })
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        res.status(500).json({ success: false, message: error.message });
    }
}