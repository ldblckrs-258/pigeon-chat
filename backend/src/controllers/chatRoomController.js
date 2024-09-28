import chatRoomService from '../services/chatRoomService.js'
import userService from '../services/userService.js'
import { CHAT_ROOM_TYPES } from '../models/chatRoomModel.js'

class ChatRoomController {
  createChatRoom = async (req, res) => {
    try {
      const userId = req.user._id
      const { receiverId } = req.body

      if (!receiverId) {
        return res.status(400).json({ message: 'receiverId is required' })
      }

      const receiver = await userService.getUserById(receiverId)

      if (!receiver) {
        return res.status(404).json({ message: 'Receiver not found' })
      }

      const chatRoom = await chatRoomService.createChatRoom(userId, receiverId)

      if (!chatRoom) {
        return res.status(400).json({ message: 'Create chat room failed' })
      }

      res.json(chatRoom)
    } catch (error) {
      res.status(400).json({ message: 'Create chat room failed' })
    }
  }

  createGroupChatRoom = async (req, res) => {
    try {
      const userId = req.user._id
      const { memberIds } = req.body

      if (!memberIds || !memberIds.length) {
        return res.status(400).json({ message: 'memberIds is required' })
      }

      const members = await Promise.all(
        memberIds.map((memberId) => userService.getUserById(memberId))
      )

      if (members.some((member) => !member)) {
        return res
          .status(404)
          .json({ message: 'At least one member not found' })
      }

      const chatRoom = await chatRoomService.createGroupChatRoom(
        userId,
        memberIds
      )

      if (!chatRoom) {
        return res
          .status(400)
          .json({ message: 'Create group chat room failed' })
      }
      res.json(chatRoom)
    } catch (error) {
      res.status(400).json({ message: 'Create group chat room failed' })
    }
  }

  getUserChatRooms = async (req, res) => {
    try {
      const userId = req.user._id
      const type = req.query.type

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }
      const chatRooms = await chatRoomService.getChatRoomsByUserId(
        userId,
        Object.values(CHAT_ROOM_TYPES).includes(type) ? type : null
      )

      res.json(chatRooms)
    } catch (error) {
      res.status(400).json({ message: 'Get chat rooms failed' })
    }
  }

  getChatRoom = async (req, res) => {
    try {
      const userId = req.user._id
      const { id } = req.params

      if (!id) {
        return res.status(400).json({ message: 'id is required' })
      }

      const chatRoom = await chatRoomService.getChatRoomByRoomId(userId, id)

      if (!chatRoom) {
        return res.status(404).json({ message: 'Chat room not found' })
      }

      res.json(chatRoom)
    } catch (error) {
      res.status(400).json({ message: 'Get chat room failed' })
    }
  }

  updateChatRoom = async (req, res) => {
    try {
      const userId = req.user._id
      const { id } = req.params
      const { name } = req.body

      if (!id) {
        return res.status(400).json({ message: 'id is required' })
      }

      const chatRoom = await chatRoomService.updateChatRoom(userId, id, name)

      if (!chatRoom) {
        return res.status(404).json({ message: 'Chat room not found' })
      }

      res.json(chatRoom)
    } catch (error) {
      res.status(400).json({ message: 'Update chat room failed' })
    }
  }

  addMembers = async (req, res) => {
    try {
      const userId = req.user._id
      const { id } = req.params
      const { memberIds } = req.body

      if (!id) {
        return res.status(400).json({ message: 'id is required' })
      }

      if (!memberIds || !memberIds.length) {
        return res.status(400).json({ message: 'memberIds is required' })
      }

      const chatRoom = await chatRoomService.addMemberToChatRoom(
        userId,
        id,
        memberIds
      )

      if (!chatRoom) {
        return res.status(404).json({ message: 'Chat room not found' })
      }

      res.json(chatRoom)
    } catch (error) {
      res.status(400).json({ message: 'Add member failed' })
    }
  }

  removeMember = async (req, res) => {
    try {
      const userId = req.user._id
      const { id } = req.params
      const { targetId } = req.body

      if (!id) {
        return res.status(400).json({ message: 'id is required' })
      }

      if (!targetId) {
        return res.status(400).json({ message: 'targetId is required' })
      }

      const chatRoom = await chatRoomService.removeMemberFromChatRoom(
        userId,
        id,
        targetId
      )

      if (!chatRoom) {
        return res.status(404).json({ message: 'Chat room not found' })
      }

      res.json(chatRoom)
    } catch (error) {
      res.status(400).json({ message: 'Remove member failed' })
    }
  }

  deleteChatRoom = async (req, res) => {
    try {
      const userId = req.user._id
      const { id } = req.params

      if (!id) {
        return res.status(400).json({ message: 'id is required' })
      }

      await chatRoomService.deleteChatRoom(userId, id)
      res.json({ message: 'Delete chat room successfully' })
    } catch (error) {
      res.status(400).json({ message: 'Delete chat room failed' })
    }
  }

  leaveChatRoom = async (req, res) => {
    try {
      const userId = req.user._id
      const { id } = req.params

      if (!id) {
        return res.status(400).json({ message: 'id is required' })
      }

      await chatRoomService.leaveChatRoom(userId, id)
      res.json({ message: 'Leave chat room successfully' })
    } catch (error) {
      console.log(error)
      res.status(400).json({ message: 'Leave chat room failed' })
    }
  }
}

export default new ChatRoomController()
