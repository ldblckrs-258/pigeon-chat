import { getHome, sendAnEmail } from '../controllers/homeController.js'
import Router from '../router.js'

const router = Router()

router.get('/get', getHome)
router.post('/send-email', sendAnEmail)

export default router
