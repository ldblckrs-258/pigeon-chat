const BaseSocketService = require('./base.socket')
const { getTime } = require('../../utils/time.util')

/**
 * Message Socket Service
 * Handles real-time messaging functionality
 */
class MessageSocketService extends BaseSocketService {
  constructor() {
    super()
  }

  /**
   * Initialize socket event handlers for messages
   * @param {Object} socket - Socket instance
   */
  handler(socket) {
    // Send message notification to chat members
    socket.on(
      'sendMsg',
      this.safeHandler((chatId, memberIds) => {
        if (!this.validateParams({ chatId, memberIds }, ['chatId', 'memberIds'])) {
          socket.emit('error', 'Invalid parameters for sendMsg')
          return
        }

        const time = getTime()
        this.emitToUsers(memberIds, 'updated', 'message', time, chatId)
      })
    )

    // Update chat notification to members
    socket.on(
      'updateChat',
      this.safeHandler((chatId, memberIds) => {
        if (!this.validateParams({ chatId, memberIds }, ['chatId', 'memberIds'])) {
          socket.emit('error', 'Invalid parameters for updateChat')
          return
        }

        const time = getTime()
        this.emitToUsers(memberIds, 'updated', 'chat', time, chatId)
      })
    )
  }

  /**
   * Send new message to chat members
   * @param {Object} data - Message data
   * @param {Array} memberIds - Array of member IDs to notify
   */
  sendMessage(data, memberIds) {
    if (!data || !Array.isArray(memberIds)) {
      this.logger.warn('Invalid parameters for sendMessage')
      return
    }

    const receivers = this.getOnlineUsersByIds(memberIds)
    if (receivers.length === 0) {
      this.logger.debug('No online receivers for message')
      return
    }

    receivers.forEach(receiver => {
      try {
        const messageData = {
          ...data,
          sender: {
            name: data?.sender?.name,
            avatar: data?.sender?.avatar,
            _id: data?.senderId,
            isMine: data?.senderId?.toString() === receiver.userId,
          },
        }

        this.io.to(receiver.socketId).emit('newMessage', messageData)
      } catch (error) {
        this.logger.error(`Error sending message to ${receiver.userId}:`, error)
      }
    })
  }

  /**
   * Notify members about message deletion
   * @param {string} chatId - Chat ID
   * @param {string} messageId - Message ID to delete
   * @param {Array} memberIds - Array of member IDs to notify
   */
  deleteMessage(chatId, messageId, memberIds) {
    if (
      !this.validateParams({ chatId, messageId, memberIds }, ['chatId', 'messageId', 'memberIds'])
    ) {
      this.logger.warn('Invalid parameters for deleteMessage')
      return
    }

    const socketIds = this.getSocketIdsByUserIds(memberIds)
    if (socketIds.length === 0) {
      this.logger.debug('No online users for message deletion')
      return
    }

    socketIds.forEach(socketId => {
      try {
        this.io.to(socketId).emit('deleteMessage', chatId, messageId)
      } catch (error) {
        this.logger.error(`Error deleting message for socket ${socketId}:`, error)
      }
    })
  }

  /**
   * Notify members about chat update
   * @param {string} chatId - Chat ID
   * @param {Array} memberIds - Array of member IDs to notify
   */
  updateChat(chatId, memberIds) {
    if (!this.validateParams({ chatId, memberIds }, ['chatId', 'memberIds'])) {
      this.logger.warn('Invalid parameters for updateChat')
      return
    }

    this.emitToUsers(memberIds, 'updateChat', chatId)
  }

  /**
   * Notify members about joining chat
   * @param {Array} memberIds - Array of member IDs to notify
   */
  joinChat(memberIds) {
    if (!Array.isArray(memberIds)) {
      this.logger.warn('Invalid memberIds for joinChat')
      return
    }

    this.emitToUsers(memberIds, 'joinChat')
  }

  /**
   * Notify members about leaving chat
   * @param {string} chatId - Chat ID
   * @param {Array} memberIds - Array of member IDs to notify
   */
  outChat(chatId, memberIds) {
    if (!this.validateParams({ chatId, memberIds }, ['chatId', 'memberIds'])) {
      this.logger.warn('Invalid parameters for outChat')
      return
    }

    this.emitToUsers(memberIds, 'outChat', chatId)
  }
}

module.exports = new MessageSocketService()
