const fileTransferSocket = require('./fileTransfer')
const messageSocket = require('./message')
const voiceCallSocket = require('./voiceCall')
const friendshipSocket = require('./friendship')

/**
 * Main Socket Services Manager
 * Manages all socket services and online users
 */
class SocketServices {
  constructor() {
    this.config = {
      cors: {
        origin: '*',
      },
    }
    this.onlineUsers = []
    this.io = null
    this.services = [messageSocket, fileTransferSocket, voiceCallSocket, friendshipSocket]
  }

  /**
   * Initialize all socket services
   * @param {Object} io - Socket.io instance
   */
  initialize(io) {
    this.io = io
    global._io = io
    global._onlineUsers = this.onlineUsers

    // Initialize all services with dependencies
    this.services.forEach(service => {
      if (typeof service.initialize === 'function') {
        service.initialize(io, this.onlineUsers)
      }
    })
  }

  /**
   * Handle new socket connection
   * @param {Object} socket - Socket instance
   */
  connection(socket) {
    // Handle user coming online
    socket.on('online', userId => {
      this.handleUserOnline(socket, userId)
    })

    // Handle user disconnection
    socket.on('disconnect', () => {
      this.handleUserDisconnect(socket)
    })

    // Initialize all service handlers
    this.services.forEach(service => {
      try {
        service.handler(socket)
      } catch (error) {
        console.error(`Error initializing service handler:`, error)
      }
    })

    // Global error handler
    socket.on('error', err => {
      console.error('Socket error:', err)
    })
  }

  /**
   * Handle user coming online
   * @param {Object} socket - Socket instance
   * @param {string} userId - User ID
   */
  handleUserOnline(socket, userId) {
    if (!userId) {
      console.warn('Invalid userId for online event')
      return
    }

    // Prevent duplicate entries for same user
    const existingUserIndex = this.onlineUsers.findIndex(u => u.userId === userId)
    if (existingUserIndex !== -1) {
      // Update socket ID if user reconnected
      this.onlineUsers[existingUserIndex].socketId = socket.id
    } else {
      // Add new online user
      this.onlineUsers.push({ userId, socketId: socket.id })
    }

    // Emit updated online users list
    this.broadcastOnlineUsers()
  }

  /**
   * Handle user disconnection
   * @param {Object} socket - Socket instance
   */
  handleUserDisconnect(socket) {
    const userIndex = this.onlineUsers.findIndex(u => u.socketId === socket.id)

    if (userIndex !== -1) {
      const user = this.onlineUsers[userIndex]
      console.log(`User ${user.userId} disconnected`)

      // Remove user from online list
      this.onlineUsers.splice(userIndex, 1)

      // Emit updated online users list
      this.broadcastOnlineUsers()
    }
  }

  /**
   * Broadcast current online users to all connected clients
   */
  broadcastOnlineUsers() {
    if (!this.io) return

    try {
      const uniqueUserIds = [...new Set(this.onlineUsers.map(u => u.userId))]
      this.io.emit('getOnlineUsers', uniqueUserIds)
    } catch (error) {
      console.error('Error broadcasting online users:', error)
    }
  }

  /**
   * Get current online users count
   * @returns {number} Number of online users
   */
  getOnlineUsersCount() {
    return new Set(this.onlineUsers.map(u => u.userId)).size
  }

  /**
   * Get online user by ID
   * @param {string} userId - User ID to find
   * @returns {Object|null} Online user object or null
   */
  getOnlineUser(userId) {
    return this.onlineUsers.find(u => u.userId === userId) || null
  }

  /**
   * Check if user is online
   * @param {string} userId - User ID to check
   * @returns {boolean} True if user is online
   */
  isUserOnline(userId) {
    return this.onlineUsers.some(u => u.userId === userId)
  }

  /**
   * Remove user from online list (force disconnect)
   * @param {string} userId - User ID to remove
   */
  removeOnlineUser(userId) {
    const initialLength = this.onlineUsers.length
    this.onlineUsers = this.onlineUsers.filter(u => u.userId !== userId)

    if (this.onlineUsers.length < initialLength) {
      this.broadcastOnlineUsers()
      return true
    }
    return false
  }
}

module.exports = new SocketServices()
