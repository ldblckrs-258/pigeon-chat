import chatRoomController from '../controllers/chatRoomController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { Router } from 'express'

const router = Router()

router.post('/create', authMiddleware, chatRoomController.createChatRoom)
router.post(
  '/create-group',
  authMiddleware,
  chatRoomController.createGroupChatRoom
)

export default router
