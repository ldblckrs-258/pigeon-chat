import HomeController from '../controllers/homeController.js'
import { Router } from 'express'

const router = Router()

router.post('/send-email', HomeController.sendMail)

export default router
