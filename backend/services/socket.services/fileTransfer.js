const BaseSocketService = require('./base.socket')

/**
 * File Transfer Socket Service
 * Handles peer-to-peer file transfer functionality
 */
class FileTransferSocketService extends BaseSocketService {
  constructor() {
    super()
  }

  /**
   * Initialize socket event handlers for file transfer
   * @param {Object} socket - Socket instance
   */
  handler(socket) {
    // Send file transfer request
    socket.on(
      'sendFileRequest',
      this.safeHandler((metadata, receiverId) => {
        if (!this.validateParams({ metadata, receiverId }, ['metadata', 'receiverId'])) {
          socket.emit('fileTransferError', 'Invalid parameters for file request')
          return
        }

        const sender = this.findOnlineUserBySocketId(socket.id)
        if (!sender) {
          socket.emit('fileTransferError', 'You are using more than one device')
          return
        }

        const receiver = this.findOnlineUser(receiverId)
        if (!receiver) {
          socket.emit('fileTransferError', 'The receiver is not online')
          return
        }

        try {
          this.io.to(receiver.socketId).emit('fileTransferRequest', metadata, sender.userId)
        } catch (error) {
          this.logger.error('Error sending file request:', error)
          socket.emit('fileTransferError', 'Failed to send file request')
        }
      })
    )

    // Accept file transfer
    socket.on(
      'fileReceiveAccept',
      this.safeHandler(senderId => {
        if (!senderId) {
          socket.emit('fileTransferError', 'Sender ID is required')
          return
        }

        const sender = this.findOnlineUser(senderId)
        if (!sender) {
          socket.emit('fileTransferError', 'The sender has closed the connection')
          return
        }

        try {
          this.io.to(sender.socketId).emit('fileTransferAccept')
        } catch (error) {
          this.logger.error('Error accepting file transfer:', error)
          socket.emit('fileTransferError', 'Failed to accept file transfer')
        }
      })
    )

    // Reject file transfer
    socket.on(
      'fileReceiveReject',
      this.safeHandler(senderId => {
        if (!senderId) {
          socket.emit('fileTransferError', 'Sender ID is required')
          return
        }

        const sender = this.findOnlineUser(senderId)
        if (!sender) {
          socket.emit('fileTransferError', 'The sender has closed the connection')
          return
        }

        try {
          this.io.to(sender.socketId).emit('fileTransferReject')
        } catch (error) {
          this.logger.error('Error rejecting file transfer:', error)
          socket.emit('fileTransferError', 'Failed to reject file transfer')
        }
      })
    )

    // Handle WebRTC sender description
    socket.on(
      'senderDesc',
      this.safeHandler((desc, receiverId) => {
        if (!this.validateParams({ desc, receiverId }, ['desc', 'receiverId'])) {
          socket.emit('fileTransferError', 'Invalid parameters for sender description')
          return
        }

        const receiver = this.findOnlineUser(receiverId)
        if (!receiver) {
          socket.emit('fileTransferError', 'The receiver is not online')
          return
        }

        try {
          this.io.to(receiver.socketId).emit('senderDesc', desc)
        } catch (error) {
          this.logger.error('Error sending sender description:', error)
          socket.emit('fileTransferError', 'Failed to send connection data')
        }
      })
    )

    // Handle WebRTC receiver description
    socket.on(
      'receiverDesc',
      this.safeHandler((desc, senderId) => {
        if (!this.validateParams({ desc, senderId }, ['desc', 'senderId'])) {
          socket.emit('fileTransferError', 'Invalid parameters for receiver description')
          return
        }

        const sender = this.findOnlineUser(senderId)
        if (!sender) {
          socket.emit('fileTransferError', 'The sender has closed the connection')
          return
        }

        try {
          this.io.to(sender.socketId).emit('receiverDesc', desc)
        } catch (error) {
          this.logger.error('Error sending receiver description:', error)
          socket.emit('fileTransferError', 'Failed to send connection data')
        }
      })
    )

    // Handle WebRTC ICE candidates
    socket.on(
      'ice-candidate',
      this.safeHandler((candidate, targetId) => {
        if (!this.validateParams({ candidate, targetId }, ['candidate', 'targetId'])) {
          socket.emit('fileTransferError', 'Invalid parameters for ICE candidate')
          return
        }

        const target = this.findOnlineUser(targetId)
        if (!target) {
          socket.emit('fileTransferError', 'The target is not online')
          return
        }

        try {
          this.io.to(target.socketId).emit('ice-candidate', candidate)
        } catch (error) {
          this.logger.error('Error sending ICE candidate:', error)
          socket.emit('fileTransferError', 'Failed to send connection data')
        }
      })
    )

    // Cancel file transfer
    socket.on(
      'fileTransferCancel',
      this.safeHandler(targetId => {
        if (!targetId) {
          socket.emit('fileTransferError', 'Target ID is required for cancellation')
          return
        }

        const target = this.findOnlineUser(targetId)
        if (target) {
          try {
            this.io.to(target.socketId).emit('fileTransferCancel')
          } catch (error) {
            this.logger.error('Error canceling file transfer:', error)
          }
        } else {
          this.logger.debug(`Target ${targetId} not online for file transfer cancellation`)
        }
      })
    )
  }

  /**
   * Notify user about file transfer error
   * @param {string} userId - User ID to notify
   * @param {string} message - Error message
   */
  notifyFileTransferError(userId, message) {
    if (!userId || !message) {
      this.logger.warn('Invalid parameters for file transfer error notification')
      return
    }

    const success = this.emitToUser(userId, 'fileTransferError', message)
    if (!success) {
      this.logger.debug(`User ${userId} not online for file transfer error notification`)
    }
  }

  /**
   * Cancel ongoing file transfer between users
   * @param {string} senderId - Sender user ID
   * @param {string} receiverId - Receiver user ID
   */
  cancelFileTransfer(senderId, receiverId) {
    if (!this.validateParams({ senderId, receiverId }, ['senderId', 'receiverId'])) {
      this.logger.warn('Invalid parameters for cancel file transfer')
      return
    }

    // Notify both users about cancellation
    this.emitToUser(senderId, 'fileTransferCancel')
    this.emitToUser(receiverId, 'fileTransferCancel')
  }
}

module.exports = new FileTransferSocketService()
