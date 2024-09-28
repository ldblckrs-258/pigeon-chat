import messageService from '../services/messageService.js'
import { MESSAGE_TYPES } from '../models/messageModel.js'

class MessageController {
  createMessage = async (req, res) => {
    try {
      const { chatRoomId } = req.params
      const { user } = req
      const { content, type } = req.body

      if (!content) {
        return res.status(400).json({ message: 'Content is required' })
      }

      if (type && !Object.values(MESSAGE_TYPES).includes(type)) {
        type = MESSAGE_TYPES.TEXT
      }

      const message = await messageService.createMessage(
        chatRoomId,
        user._id,
        content,
        type
      )

      res.json(message)
    } catch (error) {
      res.status(400).json({ message: 'Create message failed' })
    }
  }

  createFileHistory = async (req, res) => {
    try {
      const { chatRoomId } = req.params
      const { user } = req
      const { path, size } = req.body

      if (!path || !size) {
        return res.status(400).json({ message: 'Path and size are required' })
      }

      const message = await messageService.createFileHistory(
        chatRoomId,
        user._id,
        path,
        size
      )

      res.json(message)
    } catch (error) {
      res.status(400).json({ message: 'Create file history failed' })
    }
  }

  createVoiceHistory = async (req, res) => {
    try {
      const { chatRoomId } = req.params
      const { user } = req
      const { duration } = req.body

      if (!duration) {
        return res.status(400).json({ message: 'Duration is required' })
      }

      const message = await messageService.createVoiceHistory(
        chatRoomId,
        user._id,
        duration
      )

      res.json(message)
    } catch (error) {
      res.status(400).json({ message: 'Create voice history failed' })
    }
  }

  getMessages = async (req, res) => {
    try {
      const { chatRoomId } = req.params
      const { lastMessageId, limit } = req.query

      const { message, isLastPage } = await messageService.getMessages(
        chatRoomId,
        lastMessageId,
        limit
      )

      res.json({ message, isLastPage })
    } catch (error) {
      res.status(400).json({ message: 'Get messages failed' })
    }
  }

  deleteMessage = async (req, res) => {
    try {
      const { id } = req.params
      const { user } = req

      const message = await messageService.deleteMessage(id, user._id)

      if (!message) {
        return res.status(404).json({ message: 'Message not found' })
      }

      res.json(message)
    } catch (error) {
      res.status(400).json({ message: 'Delete message failed' })
    }
  }
}

export default new MessageController()
