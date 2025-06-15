const chatModel = require('../models/chat.model')
const chatHistoryService = require('./chatHistory.service')
const { createNotFoundError, createConflictError } = require('../utils/errorTypes')

class CallsService {
  /**
   * Start a voice call in a chat
   */
  async startVoiceCall(chatId, userId, userName) {
    const chat = await chatModel.findOne({
      _id: chatId,
      members: { $in: [userId] },
    })

    if (!chat) {
      throw createNotFoundError('Chat not found')
    }

    if (chat.calling) {
      throw createConflictError('Chat is already in a call')
    }

    chat.calling = 'voice'
    await chat.save()

    await chatHistoryService.createSystemMessage(chat, `${userName} started a voice call`)

    // Return receivers (all members except the caller)
    const receivers = chat.members.map(m => m.toString()).filter(m => m !== userId.toString())

    return {
      chat,
      receivers,
    }
  }

  /**
   * End a voice call in a chat
   */
  async endVoiceCall(chatId, userId) {
    const chat = await chatModel.findOne({
      _id: chatId,
      members: { $in: [userId] },
    })

    if (!chat) {
      throw createNotFoundError('Chat not found')
    }

    if (!chat.calling) {
      throw createConflictError('Chat is not in a call')
    }

    chat.calling = null
    await chat.save()

    await chatHistoryService.createSystemMessage(chat, 'Voice call ended')

    // Return receivers (all members except the caller)
    const receivers = chat.members.map(m => m.toString()).filter(m => m !== userId.toString())

    return {
      chat,
      receivers,
    }
  }

  /**
   * Check if a chat is currently in a call
   */
  async isChatInCall(chatId) {
    const chat = await chatModel.findById(chatId).select('calling')
    return chat ? !!chat.calling : false
  }

  /**
   * Get the call status of a user in a chat
   */
  async getCallStatus(chatId, userId) {
    const chat = await chatModel.findOne({
      _id: chatId,
      members: { $in: [userId] },
    })

    if (!chat) {
      throw createNotFoundError('Chat not found')
    }

    return {
      isInCall: !!chat.calling,
      callType: chat.calling,
    }
  }
}

module.exports = new CallsService()
