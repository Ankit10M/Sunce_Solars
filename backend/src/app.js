import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';


import authRouter from './routes/authRoutes.js';
import customRouter from './routes/customerRoutes.js';
import ticketRoute from './routes/ticketRoutes.js';
import jobRoute from './routes/jobCardRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import billingRouter from './routes/billingRoutes.js';
import reportRouter from './routes/reportRoutes.js';
import amcRouter from './routes/amcRoutes.js';

const app = express();

app.use(helmet())
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
)

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(obj).forEach((key) => {
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                sanitize(obj[key]);
            }
        });
    };
    sanitize(req.body);
    sanitize(req.params);
    next();
});

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many request from this IP please try again after 10 Minutes.'
    }
})
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many request from this IP please try again after 10 Minutes.'
    }
})
app.use('/api', globalLimiter)
app.use('/api/v1/auth/login', authLimiter)
app.use('/api/v1/auth/register', authLimiter)

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'ERP API is running',
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    })
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/customers', customRouter)
app.use('/api/v1/tickets', ticketRoute)
app.use('/api/v1/jobcards', jobRoute)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/billings', billingRouter)
app.use('/api/v1/reports', reportRouter)
app.use('/api/v1/amc', amcRouter)

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    })
})
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server error'
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists.`;
    }
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join('. ');
    }
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please log in again.';
    }
    const response = { success: false, message };
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }
    res.status(statusCode).json(response);
})

export default app;