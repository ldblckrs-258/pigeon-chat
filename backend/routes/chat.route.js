const express = require("express")
const authenticate = require("../middlewares/auth.middleware")
const chatController = require("../controllers/chat.controller")

const router = express.Router()

router.post("/create", authenticate, chatController.createChat)
router.get("/all", authenticate, chatController.findUserChats)
router.get("/get/:id", authenticate, chatController.getChat)
router.post("/leave/:id", authenticate, chatController.leaveChat)
router.delete("/delete/:id", authenticate, chatController.deleteChat)
router.post("/members/add", authenticate, chatController.addMembers)
router.post("/members/remove", authenticate, chatController.removeChatMember)
router.post("/edit", authenticate, chatController.editChat)

module.exports = router
