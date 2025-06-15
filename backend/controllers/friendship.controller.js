const friendshipService = require('../services/friendship.service')
const friendshipSocket = require('../services/socket.services/friendship')

/**
 * Retrieves list of user's friends with optional search functionality.
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.search=''] - Search term to filter friends by name
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const getFriends = async (req, res) => {
  try {
    const userId = req.user._id
    const search = req.query.search || ''
    const friends = await friendshipService.getFriends(userId, search)
    res.status(200).send(friends)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err.message || 'Failed to get friends' })
  }
}

/**
 * Removes a friend from user's friend list.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.friendId - ID of the friend to remove
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const removeFriend = async (req, res) => {
  try {
    const userId = req.user._id
    const { friendId } = req.body

    await friendshipService.removeFriend(userId, friendId)
    res.status(200).send({ message: 'Friend removed' })
  } catch (err) {
    console.error(err)

    if (err.message === 'Invalid friend') {
      return res.status(400).send({ message: err.message })
    }

    res.status(500).send({ message: err.message || 'Failed to remove friend' })
  }
}

/**
 * Retrieves incoming friend requests with optional search functionality.
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.search=''] - Search term to filter requests by sender name
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id
    const search = req.query.search || ''
    const requests = await friendshipService.getFriendRequests(userId, search)
    res.status(200).send(requests)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err.message || 'Failed to get friend requests' })
  }
}

/**
 * Retrieves outgoing friend requests sent by the user.
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.search=''] - Search term to filter requests by recipient name
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id
    const search = req.query.search || ''
    const requests = await friendshipService.getSentRequests(userId, search)
    res.status(200).send(requests)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err.message || 'Failed to get sent requests' })
  }
}

/**
 * Sends a friend request to another user.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.friendId - ID of the user to send friend request to
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id
    const name = req.user.name
    const { friendId } = req.body

    const result = await friendshipService.sendFriendRequest(userId, friendId)

    if (result.type === 'auto-accepted') {
      friendshipSocket.notifyFriendRequestAccepted(friendId, name)
      return res.status(200).send({ message: 'Friend request accepted' })
    } else {
      friendshipSocket.notifyFriendRequest(friendId, name)
      res.status(200).send({ message: 'Friend request sent' })
    }
  } catch (err) {
    console.error(err)

    if (err.message === 'Friend request already sent') {
      return res.status(400).send({ message: err.message })
    }

    res.status(500).send({ message: err.message || 'Failed to send friend request' })
  }
}

/**
 * Accepts an incoming friend request.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.requestId - ID of the friend request to accept
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id
    const name = req.user.name
    const { requestId } = req.body

    const request = await friendshipService.acceptFriendRequest(userId, requestId)

    // Notify the requester
    friendshipSocket.notifyFriendRequestAccepted(request.user1.toString(), name)

    res.status(200).send({ message: 'Friend request accepted' })
  } catch (err) {
    console.error(err)

    if (err.message === 'Invalid request') {
      return res.status(400).send({ message: err.message })
    }

    res.status(500).send({ message: err.message || 'Failed to accept friend request' })
  }
}

/**
 * Cancels an outgoing friend request.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.requestId - ID of the friend request to cancel
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const cancelFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id
    const { requestId } = req.body

    await friendshipService.cancelFriendRequest(userId, requestId)
    res.status(200).send({ message: 'Friend request deleted' })
  } catch (err) {
    console.error(err)

    if (err.message === 'Invalid request') {
      return res.status(400).send({ message: err.message })
    }

    res.status(500).send({ message: err.message || 'Failed to cancel friend request' })
  }
}

/**
 * Rejects an incoming friend request.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.requestId - ID of the friend request to reject
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id
    const { requestId } = req.body

    await friendshipService.rejectFriendRequest(userId, requestId)
    res.status(200).send({ message: 'Friend request rejected' })
  } catch (err) {
    console.error(err)

    if (err.message === 'Invalid request') {
      return res.status(400).send({ message: err.message })
    }

    res.status(500).send({ message: err.message || 'Failed to reject friend request' })
  }
}

/**
 * Searches for potential friends that are not already connected.
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.search=''] - Search term to find users by name
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const searchForFriends = async (req, res) => {
  try {
    const userId = req.user._id
    const search = req.query.search || ''

    const result = await friendshipService.searchForFriends(userId, search)
    res.status(200).send(result)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err.message || 'Failed to search for friends' })
  }
}

/**
 * Searches for a user by their email address for friend connections.
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.email - Email address to search for
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const searchByEmail = async (req, res) => {
  try {
    const { email } = req.query
    const user = await friendshipService.searchByEmail(req.user._id, email)
    res.status(200).send(user)
  } catch (err) {
    console.error(err)

    if (err.message === 'User not found') {
      return res.status(404).send({ message: err.message })
    }

    res.status(500).send({ message: err.message || 'Failed to search by email' })
  }
}

module.exports = {
  getFriends,
  removeFriend,
  getFriendRequests,
  getSentRequests,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  searchForFriends,
  searchByEmail,
}
