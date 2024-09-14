import AuthController from '../controllers/authController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { Router } from 'express'

const router = Router()

// Lấy thông tin người dùng
router.get('/', authMiddleware, AuthController.authenticate)

// Đăng ký
router.post('/register', AuthController.register)

// Xác thực email
router.get('/verify-email', AuthController.verifyEmail)

// Gửi lại email xác thực
router.get('/resend-v-email', authMiddleware, AuthController.resendVerifyEmail)

// Đăng nhập
router.post('/login', AuthController.login)

// Đăng xuất
router.get('/logout', authMiddleware, AuthController.logout)

export default router
