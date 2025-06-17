const express = require('express')
const router = express.Router()
const { authenticate, simpleAuth } = require('../middlewares/auth.middleware')
const { validate } = require('../middlewares/validation.middleware')
const friendshipController = require('../controllers/friendship.controller')
const {
  getFriendsSchema,
  removeFriendSchema,
  getFriendRequestsSchema,
  getSentRequestsSchema,
  sendFriendRequestSchema,
  acceptFriendRequestSchema,
  cancelFriendRequestSchema,
  rejectFriendRequestSchema,
  searchForFriendsSchema,
  searchByEmailSchema,
} = require('../schemas/friendship.schema')

router.get('/friends', simpleAuth, validate(getFriendsSchema), friendshipController.getFriends)
router.get(
  '/requests',
  simpleAuth,
  validate(getFriendRequestsSchema),
  friendshipController.getFriendRequests
)
router.get(
  '/sent-requests',
  simpleAuth,
  validate(getSentRequestsSchema),
  friendshipController.getSentRequests
)
router.post(
  '/remove-friend',
  simpleAuth,
  validate(removeFriendSchema),
  friendshipController.removeFriend
)
router.post(
  '/send-request',
  authenticate,
  validate(sendFriendRequestSchema),
  friendshipController.sendFriendRequest
)
router.post(
  '/cancel-request',
  simpleAuth,
  validate(cancelFriendRequestSchema),
  friendshipController.cancelFriendRequest
)
router.post(
  '/accept-request',
  authenticate,
  validate(acceptFriendRequestSchema),
  friendshipController.acceptFriendRequest
)
router.post(
  '/reject-request',
  simpleAuth,
  validate(rejectFriendRequestSchema),
  friendshipController.rejectFriendRequest
)
router.get(
  '/search-for-friends',
  simpleAuth,
  validate(searchForFriendsSchema),
  friendshipController.searchForFriends
)
router.get(
  '/search-by-email',
  simpleAuth,
  validate(searchByEmailSchema),
  friendshipController.searchByEmail
)

module.exports = router
