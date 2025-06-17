const express = require('express')
const multer = require('multer')
const messageController = require('../controllers/message.controller')
const { authenticate, simpleAuth } = require('../middlewares/auth.middleware')
const { validate } = require('../middlewares/validation.middleware')
const {
  createMessageSchema,
  getChatMessagesSchema,
  getNewMessagesSchema,
  deleteMessageSchema,
  createFileTransferHistorySchema,
  sendFileSchema,
} = require('../schemas/message.schema')

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8'))
  },
})

// Configure multer with file size limits and error handling
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

router.post('/send', authenticate, validate(createMessageSchema), messageController.createMessage)
router.delete(
  '/delete/:messageId',
  simpleAuth,
  validate(deleteMessageSchema),
  messageController.deleteMessage
)
router.get(
  '/get/:chatId',
  simpleAuth,
  validate(getChatMessagesSchema),
  messageController.getChatMessages
)
router.get(
  '/getNew/:chatId',
  simpleAuth,
  validate(getNewMessagesSchema),
  messageController.getNewMessages
)
router.post(
  '/fileTransferHistory',
  simpleAuth,
  validate(createFileTransferHistorySchema),
  messageController.createFileTransferHistory
)
router.post(
  '/sendFile',
  simpleAuth,
  upload.single('file'),
  validate(sendFileSchema),
  messageController.sendFile
)

module.exports = router
