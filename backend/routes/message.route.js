const express = require("express")
const messageController = require("../controllers/message.controller")
const authenticate = require("../middlewares/auth.middleware")

const router = express.Router()

router.post("/send", authenticate, messageController.createMessage)
router.delete(
  "/delete/:messageId",
  authenticate,
  messageController.deleteMessage
)
router.get("/get/:chatId", authenticate, messageController.getChatMessages)
router.get("/getNew/:chatId", authenticate, messageController.getNewMessages)

module.exports = router
