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
} = require('../schemas/auth.schema')

const router = express.Router()

router.get('/', authenticate, authController.myAccount)
router.post('/register', validate(registerSchema), authController.register)
router.get('/resend-v-email', authenticate, authController.resendVerificationEmail)
router.post('/verify-email', validate(verifySchema), authController.verify)
router.post('/login', validate(loginSchema), authController.login)
router.get('/logout', authController.logout)
router.put(
  '/update/password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
)
router.put('/update/info', authenticate, validate(updateInfoSchema), authController.updateInfo)
router.post('/google', validate(googleLoginSchema), authController.googleLogin)

module.exports = router
