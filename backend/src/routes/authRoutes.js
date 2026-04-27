import express from 'express'
import { register, login, refreshToken, logout, getMe, getEngineers,adminLogin,adminVerify,signup } from '../controllers/authController.js'
import protect from '../middleware/authMiddleware.js'

const authRouter = express.Router();
authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/signup', signup)
authRouter.post('/admin-login', adminLogin)
authRouter.post('/refresh', refreshToken)
authRouter.post('/logout', protect, logout)
authRouter.get('/me', protect, getMe)
authRouter.get('/admin-verify', adminVerify)
authRouter.get('/engineers', protect, getEngineers)

export default authRouter;
