const BaseSocketService = require('./base.socket')

/**
 * Friendship Socket Service
 * Handles real-time friendship functionality
 */
class FriendshipSocketService extends BaseSocketService {
  constructor() {
    super()
  }

  /**
   * Initialize socket event handlers for friendship
   * @param {Object} socket - Socket instance
   */
  handler(socket) {
    // Send friend request
    socket.on(
      'sendFriendRequest',
      this.safeHandler(data => {
        if (!this.validateParams(data, ['userId', 'friendId'])) {
          socket.emit('error', 'Invalid parameters for friend request')
          return
        }

        const { userId, friendId } = data
        const success = this.emitToUser(friendId, 'friendRequestReceived', { userId, friendId })

        if (!success) {
          this.logger.debug(`Friend ${friendId} not online for friend request from ${userId}`)
        }
      })
    )

    // Accept friend request
    socket.on(
      'acceptFriendRequest',
      this.safeHandler(data => {
        if (!this.validateParams(data, ['userId', 'friendId'])) {
          socket.emit('error', 'Invalid parameters for accepting friend request')
          return
        }

        const { userId, friendId } = data
        const success = this.emitToUser(friendId, 'friendRequestAccepted', { userId, friendId })

        if (!success) {
          this.logger.debug(
            `Friend ${friendId} not online for friend request acceptance from ${userId}`
          )
        }
      })
    )
  }

  /**
   * Notify user about new friend request
   * @param {string} friendId - ID of the user to notify
   * @param {string} name - Name of the user who sent the request
   */
  notifyFriendRequest(friendId, name) {
    if (!this.validateParams({ friendId, name }, ['friendId', 'name'])) {
      this.logger.warn('Invalid parameters for friend request notification')
      return
    }

    const success = this.emitToUser(friendId, 'friendRequest', name)
    if (!success) {
      this.logger.debug(`User ${friendId} not online for friend request notification from ${name}`)
    }
  }

  /**
   * Notify user about accepted friend request
   * @param {string} friendId - ID of the user to notify
   * @param {string} name - Name of the user who accepted the request
   */
  notifyFriendRequestAccepted(friendId, name) {
    if (!this.validateParams({ friendId, name }, ['friendId', 'name'])) {
      this.logger.warn('Invalid parameters for friend request accepted notification')
      return
    }

    const success = this.emitToUser(friendId, 'friendRequestAccepted', name)
    if (!success) {
      this.logger.debug(
        `User ${friendId} not online for friend request accepted notification from ${name}`
      )
    }
  }

  /**
   * Notify both users about new friendship
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @param {Object} friendshipData - Friendship data to send
   */
  notifyNewFriendship(userId1, userId2, friendshipData) {
    if (
      !this.validateParams({ userId1, userId2, friendshipData }, [
        'userId1',
        'userId2',
        'friendshipData',
      ])
    ) {
      this.logger.warn('Invalid parameters for new friendship notification')
      return
    }

    // Notify both users
    this.emitToUser(userId1, 'newFriendship', friendshipData)
    this.emitToUser(userId2, 'newFriendship', friendshipData)
  }

  /**
   * Notify users about friendship removal
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @param {string} friendshipId - ID of the removed friendship
   */
  notifyFriendshipRemoved(userId1, userId2, friendshipId) {
    if (
      !this.validateParams({ userId1, userId2, friendshipId }, [
        'userId1',
        'userId2',
        'friendshipId',
      ])
    ) {
      this.logger.warn('Invalid parameters for friendship removed notification')
      return
    }

    // Notify both users
    this.emitToUser(userId1, 'friendshipRemoved', friendshipId)
    this.emitToUser(userId2, 'friendshipRemoved', friendshipId)
  }
}

module.exports = new FriendshipSocketService()
