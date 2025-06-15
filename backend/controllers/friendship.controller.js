const friendshipService = require('../services/friendship.service')
const friendshipSocket = require('../services/socket.services/friendship')
const { StatusCodes } = require('http-status-codes')
const catchAsync = require('../utils/catchAsync')

/**
 * Retrieves list of user's friends with optional search functionality.
 */
const getFriends = catchAsync(async (req, res) => {
  const userId = req.user._id
  const search = req.query.search || ''
  const friends = await friendshipService.getFriends(userId, search)
  res.status(StatusCodes.OK).send({ status: 'success', data: friends })
})

/**
 * Removes a friend from user's friend list.
 */
const removeFriend = catchAsync(async (req, res) => {
  const userId = req.user._id
  const { friendId } = req.body

  await friendshipService.removeFriend(userId, friendId)

  res.status(StatusCodes.OK).send({ status: 'success', message: 'Friend removed' })
})

/**
 * Retrieves incoming friend requests with optional search functionality.
 */
const getFriendRequests = catchAsync(async (req, res) => {
  const userId = req.user._id
  const search = req.query.search || ''
  const requests = await friendshipService.getFriendRequests(userId, search)

  res.status(StatusCodes.OK).send({ status: 'success', data: requests })
})

/**
 * Retrieves outgoing friend requests sent by the user.
 */
const getSentRequests = catchAsync(async (req, res) => {
  const userId = req.user._id
  const search = req.query.search || ''
  const requests = await friendshipService.getSentRequests(userId, search)

  res.status(StatusCodes.OK).send({ status: 'success', data: requests })
})

/**
 * Sends a friend request to another user.
 */
const sendFriendRequest = catchAsync(async (req, res) => {
  const userId = req.user._id
  const name = req.user.name
  const { friendId } = req.body

  const result = await friendshipService.sendFriendRequest(userId, friendId)

  if (result.type === 'auto-accepted') {
    friendshipSocket.notifyFriendRequestAccepted(friendId, name)
    return res
      .status(StatusCodes.OK)
      .send({ status: 'success', message: 'Friend request accepted' })
  } else {
    friendshipSocket.notifyFriendRequest(friendId, name)
    res.status(StatusCodes.OK).send({ status: 'success', message: 'Friend request sent' })
  }
})

/**
 * Accepts an incoming friend request.
 */
const acceptFriendRequest = catchAsync(async (req, res) => {
  const userId = req.user._id
  const name = req.user.name
  const { requestId } = req.body

  const request = await friendshipService.acceptFriendRequest(userId, requestId)

  friendshipSocket.notifyFriendRequestAccepted(request.user1.toString(), name)

  res.status(StatusCodes.OK).send({ status: 'success', message: 'Friend request accepted' })
})

/**
 * Cancels an outgoing friend request.
 */
const cancelFriendRequest = catchAsync(async (req, res) => {
  const userId = req.user._id
  const { requestId } = req.body

  await friendshipService.cancelFriendRequest(userId, requestId)

  res.status(StatusCodes.OK).send({ status: 'success', message: 'Friend request deleted' })
})

/**
 * Rejects an incoming friend request.
 */
const rejectFriendRequest = catchAsync(async (req, res) => {
  const userId = req.user._id
  const { requestId } = req.body

  await friendshipService.rejectFriendRequest(userId, requestId)

  res.status(StatusCodes.OK).send({ status: 'success', message: 'Friend request rejected' })
})

/**
 * Searches for potential friends that are not already connected.
 */
const searchForFriends = catchAsync(async (req, res) => {
  const userId = req.user._id
  const search = req.query.search || ''

  const result = await friendshipService.searchForFriends(userId, search)

  res.status(StatusCodes.OK).send({ status: 'success', data: result })
})

/**
 * Searches for a user by their email address for friend connections.
 */
const searchByEmail = catchAsync(async (req, res) => {
  const { email } = req.query
  const user = await friendshipService.searchByEmail(req.user._id, email)

  res.status(StatusCodes.OK).send({ status: 'success', data: user })
})

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
