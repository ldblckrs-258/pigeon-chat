const BaseSocketService = require('./base.socket')
const chatHistoryService = require('../chatHistory.service')

/**
 * Voice Call Socket Service
 * Handles real-time voice call functionality
 */
class VoiceCallSocketService extends BaseSocketService {
  constructor() {
    super()
  }

  /**
   * Initialize socket event handlers for voice calls
   * @param {Object} socket - Socket instance
   */
  handler(socket) {
    // Join voice call room
    socket.on(
      'joinVoiceRoom',
      this.safeHandler((chatId, userId) => {
        if (!this.validateParams({ chatId, userId }, ['chatId', 'userId'])) {
          socket.emit('error', 'Invalid parameters for joinVoiceRoom')
          return
        }

        socket.join(chatId)
        const user = this.findOnlineUser(userId)

        const currentUsers = this.getCallingUsers(chatId)
        const allUsers = new Set([...currentUsers, user?.userId])
        const userIds = [...allUsers].filter(Boolean)

        socket.emit('callingUsers', userIds)
        socket.to(chatId).emit('callingUsers', userIds)
      })
    )

    // Get current calling users
    socket.on(
      'getCallingUsers',
      this.safeHandler(chatId => {
        if (!chatId) {
          socket.emit('error', 'Chat ID is required for getCallingUsers')
          return
        }

        const users = this.getCallingUsers(chatId)
        socket.emit('callingUsers', users)
      })
    )

    // Leave voice call room
    socket.on(
      'leaveVoiceRoom',
      this.safeHandler(chatId => {
        if (!chatId) {
          socket.emit('error', 'Chat ID is required for leaveVoiceRoom')
          return
        }

        socket.leave(chatId)
        const user = this.findOnlineUserBySocketId(socket.id)

        if (!user) {
          this.logger.warn('User not found when leaving voice room')
          return
        }

        const room = this.io.sockets.adapter.rooms.get(chatId)
        if (!room || room.size === 0) {
          this.voiceCallEnd(chatId)
        } else {
          const remainingUsers = this.getCallingUsers(chatId)
          const filteredUsers = remainingUsers.filter(userId => userId !== user.userId)
          socket.to(chatId).emit('callingUsers', filteredUsers)
        }
      })
    )

    // Handle audio stream
    socket.on(
      'audioStream',
      this.safeHandler((chatId, stream) => {
        if (!this.validateParams({ chatId, stream }, ['chatId', 'stream'])) {
          socket.emit('error', 'Invalid parameters for audioStream')
          return
        }

        socket.to(chatId).emit('audioStream', stream)
      })
    )

    // Handle WebRTC ICE candidates
    socket.on(
      'channel-ice-candidate',
      this.safeHandler((chatId, candidate, userId) => {
        if (
          !this.validateParams({ chatId, candidate, userId }, ['chatId', 'candidate', 'userId'])
        ) {
          socket.emit('error', 'Invalid parameters for channel-ice-candidate')
          return
        }

        socket.to(chatId).emit('channel-ice-candidate', candidate, userId)
      })
    )

    // Handle WebRTC offers
    socket.on(
      'offer',
      this.safeHandler((chatId, offer, userId) => {
        if (!this.validateParams({ chatId, offer, userId }, ['chatId', 'offer', 'userId'])) {
          socket.emit('error', 'Invalid parameters for offer')
          return
        }

        socket.to(chatId).emit('offer', offer, userId)
      })
    )

    // Handle WebRTC answers
    socket.on(
      'answer',
      this.safeHandler((chatId, answer, userId) => {
        if (!this.validateParams({ chatId, answer, userId }, ['chatId', 'answer', 'userId'])) {
          socket.emit('error', 'Invalid parameters for answer')
          return
        }

        socket.to(chatId).emit('answer', answer, userId)
      })
    )
  }

  /**
   * Notify members about voice call start
   * @param {string} chatId - Chat ID
   * @param {Array} memberIds - Array of member IDs to notify
   */
  voiceCallStart(chatId, memberIds) {
    if (!this.validateParams({ chatId, memberIds }, ['chatId', 'memberIds'])) {
      this.logger.warn('Invalid parameters for voiceCallStart')
      return
    }

    this.emitToUsers(memberIds, 'voiceCallStart', chatId)
  }

  /**
   * End voice call and notify participants
   * @param {string} chatId - Chat ID
   * @param {Array} receiverIds - Optional specific receivers to notify
   */
  voiceCallEnd(chatId, receiverIds) {
    if (!chatId) {
      this.logger.warn('Chat ID is required for voiceCallEnd')
      return
    }

    try {
      // Emit to all users in the room
      this.io.to(chatId).emit('voiceCallEnd')

      // Update chat history
      chatHistoryService.endCalling(chatId)

      // If specific receiver (for 1-on-1 calls)
      if (receiverIds?.length === 1) {
        const success = this.emitToUser(receiverIds[0], 'voiceCallEnd', chatId)
        if (!success) {
          this.logger.debug(`Receiver ${receiverIds[0]} not online for call end notification`)
        }
      }
    } catch (error) {
      this.logger.error('Error ending voice call:', error)
    }
  }

  /**
   * Get list of users currently in voice call
   * @param {string} chatId - Chat ID
   * @returns {Array} Array of user IDs in the call
   */
  getCallingUsers(chatId) {
    if (!chatId) {
      this.logger.warn('Chat ID is required for getCallingUsers')
      return []
    }

    const room = this.io.sockets.adapter.rooms.get(chatId)
    const users = []

    if (room) {
      for (let socketId of room) {
        const user = this.findOnlineUserBySocketId(socketId)
        if (user) {
          users.push(user.userId)
        }
      }
    }

    return users
  }
}

module.exports = new VoiceCallSocketService()
