import AuthController from '../controllers/authController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { Router } from 'express'

const router = Router()

router.get('/', authMiddleware, AuthController.authenticate)
router.post('/register', AuthController.register)
router.get('/verify-email', AuthController.verifyEmail)
router.get('/resend-v-email', authMiddleware, AuthController.resendVerifyEmail)
router.post('/login', AuthController.login)
router.get('/logout', authMiddleware, AuthController.logout)

export default router
