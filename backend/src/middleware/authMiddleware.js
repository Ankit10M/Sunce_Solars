import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Notoken Provided Please Login in' })
        }
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        const user = await User.findById(decoded.id).select('-password')
        if (!user) {
            return res.status(401).json({ message: 'user belonging to this token no longer exists', success: false })
        }
        // COMMENTED OUT FOR DEV: Allow access even if isActive is false
        // if (!user.isActive) {
        //     return res.status(401).json({ message: 'Your Account has been deactivated. Contact Admin', success: false })
        // }
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token Expired Please login again' })
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid Token Please login again' })
        }
        return res.status(500).json({ success: false, message: 'Internal Server error' })
    }
}
export default protect;