import {
  register,
  login,
  logout,
  authenticate
} from '../controllers/authController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import Router from '../router.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)
router.get('/authenticate', authMiddleware, authenticate)

export default router
