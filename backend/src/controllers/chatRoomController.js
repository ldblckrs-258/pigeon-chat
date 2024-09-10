import chatRoomService from '../services/chatRoomService.js'

class ChatRoomController {
  createChatRoom = async (req, res) => {
    try {
      const userId = req.user._id
      const { receiverId } = req.body
      const chatRoom = await chatRoomService.createChatRoom(userId, receiverId)
      res.json(chatRoom)
    } catch (error) {
      console.error(error)
      res.status(400).json({ message: 'Create chat room failed' })
    }
  }

  createGroupChatRoom = async (req, res) => {
    try {
      const userId = req.user._id
      const { memberIds } = req.body
      const chatRoom = await chatRoomService.createGroupChatRoom(
        userId,
        memberIds
      )
      res.json(chatRoom)
    } catch (error) {
      console.error(error)
      res.status(400).json({ message: 'Create group chat room failed' })
    }
  }
}

export default new ChatRoomController()
