const messageModel = require('../models/message.model')
const chatModel = require('../models/chat.model')
const fs = require('fs')
const { createUnauthorizedError, createNotFoundError } = require('../utils/errorTypes')

class MessageService {
  /**
   * Create a new message in a chat
   */
  async createMessage(chatId, senderId, content, type = 'text') {
    const chatRoom = await chatModel.findById(chatId)

    if (!chatRoom) {
      throw createNotFoundError('Chat not found')
    }

    const newMessage = new messageModel({
      chatId,
      senderId,
      content,
      type,
      status: 'completed',
      readerIds: [senderId],
    })

    const savedMessage = await newMessage.save()

    // Get other members for socket notification
    const memberIds = chatRoom.members
      .map(member => member.toString())
      .filter(member => member !== senderId.toString())

    return {
      message: savedMessage,
      chatRoom,
      memberIds,
    }
  }

  /**
   * Get messages for a chat
   */
  async getChatMessages(chatId, userId, skip = 0, limit = 10) {
    const totalMessages = await messageModel.countDocuments({ chatId })

    if (totalMessages === 0 || skip >= totalMessages) {
      return {
        messages: [],
        haveMore: false,
        total: totalMessages,
      }
    }

    const haveMore = totalMessages > skip + limit

    const messages = await messageModel
      .find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-updatedAt -__v -chatId')
      .populate('senderId', 'name avatar')

    if (!messages || messages.length === 0) {
      return {
        messages: [],
        haveMore: false,
        total: totalMessages,
      }
    }

    // Mark messages as read
    await this.markMessagesAsRead(messages, userId)

    // Format messages
    const modifiedMessages = this.formatMessages(messages, userId)

    return {
      messages: modifiedMessages,
      haveMore,
      total: totalMessages,
    }
  }

  /**
   * Get new messages since the last message ID
   */
  async getNewMessages(chatId, userId, lastMessageId) {
    const lastMessage = await messageModel.findById(lastMessageId)

    if (!lastMessage) {
      throw createNotFoundError('Message not found')
    }

    const messages = await messageModel
      .find({ chatId, createdAt: { $gt: lastMessage.createdAt } })
      .select('-updatedAt -__v -chatId')
      .populate('senderId', 'name avatar')

    if (!messages || messages.length === 0) {
      return []
    }

    // Mark messages as read
    await this.markMessagesAsRead(messages, userId)

    // Format messages
    return this.formatMessages(messages, userId)
  }

  /**
   * Delete a message by ID
   */
  async deleteMessage(messageId, userId) {
    const message = await messageModel.findById(messageId)

    if (!message) {
      throw createNotFoundError('Message not found')
    }

    if (message.senderId.toString() !== userId.toString()) {
      throw createUnauthorizedError()
    }

    const chat = await chatModel.findById(message.chatId)

    if (!chat) {
      throw createNotFoundError('Chat not found')
    }

    if (!chat.members.includes(userId)) {
      throw createUnauthorizedError()
    }

    await messageModel.findByIdAndDelete(messageId)

    // Delete file if it's a file message
    if (message.type === 'file') {
      fs.unlink(`./uploads/${message.content}`, err => {
        if (err) console.error('Error deleting file:', err)
      })
    }

    const memberIds = chat.members.map(member => member.toString())

    return {
      message,
      chat,
      memberIds,
    }
  }

  /**
   * Mark messages as read by a user
   */
  async markMessagesAsRead(messages, userId) {
    const updatePromises = messages
      .filter(message => !message.readerIds.includes(userId))
      .map(message => {
        message.readerIds.push(userId)
        return message.save()
      })

    await Promise.all(updatePromises)
  }

  /**
   * Format messages for the client
   */
  formatMessages(messages, userId) {
    return messages.map(message => {
      let sender = null
      if (message.senderId) {
        sender = {
          isMine: message.senderId._id.toString() === userId.toString(),
          _id: message.senderId._id,
          name: message.senderId.name,
          avatar: message.senderId.avatar,
        }
      }

      return {
        _id: message._id,
        sender,
        content: message.content,
        type: message.type,
        size: message?.size || 0,
        status: message.status || 'completed',
        createdAt: message.createdAt,
      }
    })
  }

  /**
   * Get a message by its ID
   */
  async getMessageById(messageId) {
    const message = await messageModel.findById(messageId)

    if (!message) {
      throw createNotFoundError('Message not found')
    }

    return message
  }

  /**
   * Update the status of a message
   */
  async updateMessageStatus(messageId, status) {
    const message = await messageModel.findByIdAndUpdate(messageId, { status }, { new: true })

    if (!message) {
      throw createNotFoundError('Message not found')
    }

    return message
  }

  /**
   * Get the count of unread messages for a user in a chat
   */
  async getUnreadMessageCount(chatId, userId) {
    const count = await messageModel.countDocuments({
      chatId,
      readerIds: { $nin: [userId] },
    })

    return count
  }

  /**
   * Get statistics of messages in a chat
   */
  async getMessageStats(chatId) {
    const stats = await messageModel.aggregate([
      { $match: { chatId: chatId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ])

    const total = await messageModel.countDocuments({ chatId })

    return {
      total,
      byType: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count
        return acc
      }, {}),
    }
  }
}

module.exports = new MessageService()
