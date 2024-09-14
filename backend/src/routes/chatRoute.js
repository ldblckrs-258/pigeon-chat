import chatRoomController from '../controllers/chatRoomController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { Router } from 'express'

const router = Router()
router.use(authMiddleware)

//  Lấy danh sách phòng chat của người dùng
router.get('/', chatRoomController.getUserChatRooms)

//  Tạo phòng chat
router.post('/create', chatRoomController.createChatRoom)

//  Tạo phòng chat nhóm
router.post('/create-group', chatRoomController.createGroupChatRoom)

//  Lấy thông tin phòng chat theo ID
router.get('/:id', chatRoomController.getChatRoom)

//  Cập nhật thông tin phòng chat
router.put('/:id', chatRoomController.updateChatRoom)

//  Xóa phòng chat
router.delete('/:id', chatRoomController.deleteChatRoom)

//  Thêm thành viên vào phòng chat
router.post('/:id/members', chatRoomController.addMembers)

//  Xóa thành viên khỏi phòng chat
router.delete('/:id/members', chatRoomController.removeMember)

//  Rời khỏi phòng chat
router.delete('/:id/leave', chatRoomController.leaveChatRoom)
export default router
