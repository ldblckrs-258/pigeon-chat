const express = require('express')
const authController = require('../controllers/auth.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const { validate } = require('../middlewares/validation.middleware')
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateInfoSchema,
  googleLoginSchema,
  verifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../schemas/auth.schema')
const { authLimiter } = require('../middlewares/rateLimiter.middleware')

const router = express.Router()

router.get('/', authenticate, authController.myAccount)
router.post('/register', authLimiter, validate(registerSchema), authController.register)
router.get('/resend-v-email', authLimiter, authenticate, authController.resendVerificationEmail)
router.post('/verify-email', authLimiter, validate(verifySchema), authController.verify)
router.post('/login', authLimiter, validate(loginSchema), authController.login)
router.get('/logout', authController.logout)
router.put(
  '/update/password',
  authLimiter,
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
)
router.put(
  '/update/info',
  authLimiter,
  authenticate,
  validate(updateInfoSchema),
  authController.updateInfo
)
router.post('/google', authLimiter, validate(googleLoginSchema), authController.googleLogin)
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
)
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
)

module.exports = router
