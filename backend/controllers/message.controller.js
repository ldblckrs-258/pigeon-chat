const messageService = require('../services/message.service')
const messageSocket = require('../services/socket.services/message')
const ChatHistoryService = require('../services/chatHistory.service')
const { StatusCodes } = require('http-status-codes')
const catchAsync = require('../utils/catchAsync')

/**
 * Creates a new message in a chat.
 */
const createMessage = catchAsync(async (req, res) => {
  const chatId = req.body.chatId
  const content = req.body.content
  const type = req.body.type || 'text'

  const { message, memberIds } = await messageService.createMessage(
    chatId,
    req.user._id,
    content,
    type
  )

  let data = {
    ...message._doc,
    sender: {
      isMine: false,
      _id: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar,
    },
  }

  messageSocket.sendMessage(data, memberIds)

  data.sender.isMine = true

  res.status(StatusCodes.CREATED).send({ status: 'success', message: data })
})

/**
 * Retrieves paginated messages from a specific chat.
 */
const getChatMessages = catchAsync(async (req, res) => {
  const userId = req.user._id
  const chatId = req.params.chatId
  const skip = parseInt(req.query.skip) || 0
  const limit = parseInt(req.query.limit) || 10

  const { messages, haveMore } = await messageService.getChatMessages(chatId, userId, skip, limit)

  if (messages.length === 0) {
    return res.status(StatusCodes.NO_CONTENT).send({ status: 'success', data: [] })
  }

  res.status(StatusCodes.OK).send({
    status: 'success',
    data: messages,
    haveMore,
  })
})

/**
 * Retrieves new messages in a chat after a specific message.
 */
const getNewMessages = catchAsync(async (req, res) => {
  const userId = req.user._id
  const chatId = req.params.chatId
  const lastMessageId = req.query.lastMessageId

  const messages = await messageService.getNewMessages(chatId, userId, lastMessageId)

  if (!messages || messages.length === 0) {
    return res.status(StatusCodes.NO_CONTENT).send({ status: 'success', data: [] })
  }

  res.status(StatusCodes.OK).send({
    status: 'success',
    data: messages,
  })
})

/**
 * Deletes a message from a chat.
 */
const deleteMessage = catchAsync(async (req, res) => {
  const userId = req.user._id
  const messageId = req.params.messageId

  const { message, chat, memberIds } = await messageService.deleteMessage(messageId, userId)

  messageSocket.deleteMessage(message.chatId, messageId, memberIds)

  res.status(StatusCodes.OK).send({ status: 'success', message: 'Message deleted successfully' })
})

/**
 * Creates a file transfer history record.
 */
const createFileTransferHistory = catchAsync(async (req, res) => {
  const chatId = req.body.chatId
  const user = req.user
  const fileName = req.body.fileName
  const fileSize = req.body.fileSize
  const status = req.body.status || 'completed'

  await ChatHistoryService.createFileTransferHistory(chatId, user, fileName, fileSize, status)

  res
    .status(StatusCodes.CREATED)
    .send({ status: 'success', message: 'File transfer history created successfully' })
})

/**
 * Uploads a file to a chat and creates upload history.
 */
const sendFile = catchAsync(async (req, res) => {
  const file = req.file
  if (!file) {
    return res.status(StatusCodes.BAD_REQUEST).send({ status: 'error', message: 'No file found' })
  }

  await ChatHistoryService.createFileUploadHistory(
    req.body.chatId,
    req.user,
    file.path.slice(8),
    file.size,
    'completed'
  )

  res.status(StatusCodes.CREATED).send({ status: 'success', message: 'File uploaded successfully' })
})

module.exports = {
  createMessage,
  getChatMessages,
  getNewMessages,
  deleteMessage,
  createFileTransferHistory,
  sendFile,
}
