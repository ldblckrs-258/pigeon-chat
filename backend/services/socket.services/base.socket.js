/**
 * Base Socket Service
 * Provides common functionality and dependencies for all socket services
 */
class BaseSocketService {
  constructor() {
    this.io = null
    this.onlineUsers = null
    this.logger = console // Can be replaced with proper logger
  }

  /**
   * Initialize the service with io and onlineUsers references
   * @param {Object} io - Socket.io instance
   * @param {Array} onlineUsers - Reference to online users array
   */
  initialize(io, onlineUsers) {
    this.io = io
    this.onlineUsers = onlineUsers
  }

  /**
   * Find online user by userId
   * @param {string} userId - User ID to find
   * @returns {Object|undefined} Online user object
   */
  findOnlineUser(userId) {
    if (!this.onlineUsers || !Array.isArray(this.onlineUsers)) {
      this.logger.warn('Online users not properly initialized')
      return undefined
    }
    return this.onlineUsers.find(u => u.userId === userId)
  }

  /**
   * Find online user by socket ID
   * @param {string} socketId - Socket ID to find
   * @returns {Object|undefined} Online user object
   */
  findOnlineUserBySocketId(socketId) {
    if (!this.onlineUsers || !Array.isArray(this.onlineUsers)) {
      this.logger.warn('Online users not properly initialized')
      return undefined
    }
    return this.onlineUsers.find(u => u.socketId === socketId)
  }

  /**
   * Get online users by user IDs
   * @param {Array} userIds - Array of user IDs
   * @returns {Array} Array of online user objects
   */
  getOnlineUsersByIds(userIds) {
    if (!Array.isArray(userIds)) return []
    return this.onlineUsers.filter(u => userIds.includes(u.userId))
  }

  /**
   * Get socket IDs from user IDs
   * @param {Array} userIds - Array of user IDs
   * @returns {Array} Array of socket IDs
   */
  getSocketIdsByUserIds(userIds) {
    return this.getOnlineUsersByIds(userIds).map(u => u.socketId)
  }

  /**
   * Emit to specific users
   * @param {Array} userIds - Array of user IDs to emit to
   * @param {string} event - Event name
   * @param {...any} args - Event arguments
   */
  emitToUsers(userIds, event, ...args) {
    if (!Array.isArray(userIds)) {
      this.logger.warn('emitToUsers: userIds must be an array')
      return
    }

    const socketIds = this.getSocketIdsByUserIds(userIds)
    if (socketIds.length === 0) {
      this.logger.debug(`No online users found for event: ${event}`)
      return
    }

    socketIds.forEach(socketId => {
      try {
        this.io.to(socketId).emit(event, ...args)
      } catch (error) {
        this.logger.error(`Error emitting to socket ${socketId}:`, error)
      }
    })
  }

  /**
   * Emit to specific user
   * @param {string} userId - User ID to emit to
   * @param {string} event - Event name
   * @param {...any} args - Event arguments
   */
  emitToUser(userId, event, ...args) {
    const user = this.findOnlineUser(userId)
    if (!user) {
      this.logger.debug(`User ${userId} not online for event: ${event}`)
      return false
    }

    try {
      this.io.to(user.socketId).emit(event, ...args)
      return true
    } catch (error) {
      this.logger.error(`Error emitting to user ${userId}:`, error)
      return false
    }
  }

  /**
   * Validate required parameters
   * @param {Object} params - Parameters to validate
   * @param {Array} required - Array of required parameter names
   * @returns {boolean} True if all required params exist
   */
  validateParams(params, required) {
    if (!params || typeof params !== 'object') {
      this.logger.warn('Invalid params object')
      return false
    }

    const missing = required.filter(param => params[param] === undefined || params[param] === null)

    if (missing.length > 0) {
      this.logger.warn(`Missing required parameters: ${missing.join(', ')}`)
      return false
    }

    return true
  }

  /**
   * Safe socket event handler wrapper
   * @param {Function} handler - Event handler function
   * @returns {Function} Wrapped handler with error handling
   */
  safeHandler(handler) {
    return (...args) => {
      try {
        return handler.apply(this, args)
      } catch (error) {
        this.logger.error('Socket handler error:', error)
      }
    }
  }

  /**
   * Abstract method - must be implemented by subclasses
   * @param {Object} socket - Socket instance
   */
  handler(socket) {
    throw new Error('handler method must be implemented by subclass')
  }
}

module.exports = BaseSocketService
