const express = require('express')
const router = express.Router()
const { authenticate, simpleAuth } = require('../middlewares/auth.middleware')
const friendshipController = require('../controllers/friendship.controller')

router.get('/friends', simpleAuth, friendshipController.getFriends)
router.get('/requests', simpleAuth, friendshipController.getFriendRequests)
router.get('/sent-requests', simpleAuth, friendshipController.getSentRequests)
router.post('/remove-friend', simpleAuth, friendshipController.removeFriend)
router.post('/send-request', authenticate, friendshipController.sendFriendRequest)
router.post('/cancel-request', simpleAuth, friendshipController.cancelFriendRequest)
router.post('/accept-request', authenticate, friendshipController.acceptFriendRequest)
router.post('/reject-request', simpleAuth, friendshipController.rejectFriendRequest)
router.get('/search-for-friends', simpleAuth, friendshipController.searchForFriends)
router.get('/search-by-email', simpleAuth, friendshipController.searchByEmail)

module.exports = router
