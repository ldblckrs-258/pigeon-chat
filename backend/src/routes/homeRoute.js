import { getHome, sendAnEmail } from '../controllers/homeController.js'
import { Router } from 'express'

const router = Router()

router.get('/get', getHome)
router.post('/send-email', sendAnEmail)

export default router
