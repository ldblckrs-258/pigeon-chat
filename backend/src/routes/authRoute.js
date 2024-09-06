import {
  register,
  resendVerificationEmail,
  verifyEmail,
  login,
  logout,
  authenticate
} from '../controllers/authController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { Router } from 'express'

const router = Router()

router.get('/', authMiddleware, authenticate)
router.post('/register', register)
router.post('/resend-v-email', authMiddleware, resendVerificationEmail)
router.get('/verify-email', verifyEmail)
router.post('/login', login)
router.get('/logout', logout)

export default router
