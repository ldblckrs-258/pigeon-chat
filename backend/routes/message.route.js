const express = require("express")
const multer = require("multer")
const messageController = require("../controllers/message.controller")
const authenticate = require("../middlewares/auth.middleware")

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Buffer.from(file.originalname, "latin1").toString("utf8"))
  },
})
const upload = multer({ storage: storage })

router.post("/send", authenticate, messageController.createMessage)
router.delete(
  "/delete/:messageId",
  authenticate,
  messageController.deleteMessage
)
router.get("/get/:chatId", authenticate, messageController.getChatMessages)
router.get("/getNew/:chatId", authenticate, messageController.getNewMessages)
router.post(
  "/fileTransferHistory",
  authenticate,
  messageController.createFileTransferHistory
)
router.post(
  "/sendFile",
  authenticate,
  upload.single("file"),
  messageController.sendFile
)

module.exports = router
