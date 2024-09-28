import messageController from '../controllers/messageController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { roomMemberMiddleware } from '../middlewares/roomMemberMiddleware.js'

import { Router } from 'express'

const router = Router()
router.use(authMiddleware)
router.use(roomMemberMiddleware)

//  Lấy danh sách tin nhắn của phòng chat
router.get('/:chatRoomId', messageController.getMessages)

//  Gửi tin nhắn văn bản / emoji / hình ảnh
router.post('/:chatRoomId', messageController.createMessage)

//  Tạo lịch sử truyền file
router.post('/:chatRoomId/file', messageController.createFileHistory)

//  Tạo lịch sử cuộc gọi thoại
router.post('/:chatRoomId/voice', messageController.createVoiceHistory)

// Xóa tin nhắn
router.delete('/:id', messageController.deleteMessage)

export default router
