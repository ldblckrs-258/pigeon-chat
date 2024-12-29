const express = require("express")
const router = express.Router()
const authMiddleware = require("../middlewares/auth.middleware")
const friendshipController = require("../controllers/friendship.controller")

router.get("/friends", authMiddleware, friendshipController.getFriends)
router.get("/requests", authMiddleware, friendshipController.getFriendRequests)
router.get(
  "/sent-requests",
  authMiddleware,
  friendshipController.getSentRequests
)
router.post("/remove-friend", authMiddleware, friendshipController.removeFriend)
router.post(
  "/send-request",
  authMiddleware,
  friendshipController.sendFriendRequest
)
router.post(
  "/cancel-request",
  authMiddleware,
  friendshipController.cancelFriendRequest
)
router.post(
  "/accept-request",
  authMiddleware,
  friendshipController.acceptFriendRequest
)
router.post(
  "/reject-request",
  authMiddleware,
  friendshipController.rejectFriendRequest
)
router.get(
  "/search-for-friends",
  authMiddleware,
  friendshipController.searchForFriends
)
router.get(
  "/search-by-email",
  authMiddleware,
  friendshipController.searchByEmail
)

module.exports = router
