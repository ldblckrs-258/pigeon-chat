const messageService = require('../services/message.service')
const messageSocket = require('../services/socket.services/message')
const ChatHistoryService = require('../services/chatHistory.service')

/**
 * Creates a new message in a chat.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.chatId - ID of the chat to send message to
 * @param {string} req.body.content - Message content
 * @param {string} [req.body.type='text'] - Message type (text, image, file, etc.)
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const createMessage = async (req, res) => {
  const chatId = req.body.chatId
  const content = req.body.content
  const type = req.body.type || 'text'

  try {
    const { message, chatRoom, memberIds } = await messageService.createMessage(
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

    res.status(201).send({
      message: data,
    })
  } catch (err) {
    console.error(err)

    if (err.message === 'Chat not found') {
      return res.status(404).send({ message: err.message })
    }

    res.status(500).send({ message: 'Request failed, please try again later.' })
  }
}

/**
 * Retrieves paginated messages from a specific chat.
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.chatId - ID of the chat to get messages from
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.skip=0] - Number of messages to skip for pagination
 * @param {number} [req.query.limit=10] - Maximum number of messages to return
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const getChatMessages = async (req, res) => {
  const userId = req.user._id
  const chatId = req.params.chatId
  const skip = parseInt(req.query.skip) || 0
  const limit = parseInt(req.query.limit) || 10

  try {
    const { messages, haveMore, total } = await messageService.getChatMessages(
      chatId,
      userId,
      skip,
      limit
    )

    if (messages.length === 0) {
      return res.status(200).send({
        message: 'No messages found',
        data: [],
      })
    }

    res.status(200).send({
      message: 'Messages retrieved successfully',
      data: messages,
      haveMore,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: 'Request failed, please try again later.' })
  }
}

/**
 * Retrieves new messages in a chat after a specific message.
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.chatId - ID of the chat to get new messages from
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.lastMessageId - ID of the last message the client has
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const getNewMessages = async (req, res) => {
  const userId = req.user._id
  const chatId = req.params.chatId
  const lastMessageId = req.query.lastMessageId

  try {
    const messages = await messageService.getNewMessages(chatId, userId, lastMessageId)

    if (!messages || messages.length === 0) {
      return res.status(200).send({
        message: 'No new messages found',
        data: [],
      })
    }

    res.status(200).send({
      message: 'New messages retrieved successfully',
      data: messages,
    })
  } catch (err) {
    console.error(err)

    if (err.message === 'Message not found') {
      return res.status(404).send({ message: err.message })
    }

    res.status(500).send({ message: 'Request failed, please try again later.' })
  }
}

/**
 * Deletes a message from a chat.
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.messageId - ID of the message to delete
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const deleteMessage = async (req, res) => {
  const userId = req.user._id
  const messageId = req.params.messageId

  try {
    const { message, chat, memberIds } = await messageService.deleteMessage(messageId, userId)

    messageSocket.deleteMessage(message.chatId, messageId, memberIds)

    res.status(200).send({ message: 'Message deleted successfully' })
  } catch (err) {
    console.error(err)

    if (err.message === 'Message not found' || err.message === 'Chat not found') {
      return res.status(404).send({ message: err.message })
    }

    if (err.message === 'Unauthorized') {
      return res.status(403).send({ message: err.message })
    }

    res.status(500).send({ message: 'Request failed, please try again later.' })
  }
}

/**
 * Creates a file transfer history record.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.chatId - ID of the chat where file transfer occurred
 * @param {string} req.body.fileName - Name of the transferred file
 * @param {number} req.body.fileSize - Size of the transferred file in bytes
 * @param {string} [req.body.status='completed'] - Status of the file transfer
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const createFileTransferHistory = async (req, res) => {
  const chatId = req.body.chatId
  const user = req.user
  const fileName = req.body.fileName
  const fileSize = req.body.fileSize
  const status = req.body.status || 'completed'

  try {
    await ChatHistoryService.createFileTransferHistory(chatId, user, fileName, fileSize, status)

    res.status(201).send({ message: 'File transfer history created successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: 'Request failed, please try again later.' })
  }
}

/**
 * Uploads a file to a chat and creates upload history.
 * @param {Object} req - Express request object
 * @param {Object} req.file - Uploaded file object from multer middleware
 * @param {Object} req.body - Request body
 * @param {string} req.body.chatId - ID of the chat to upload file to
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const sendFile = async (req, res) => {
  try {
    const file = req.file
    if (!file) {
      return res.status(400).send({ message: 'No file found' })
    }

    await ChatHistoryService.createFileUploadHistory(
      req.body.chatId,
      req.user,
      file.path.slice(8),
      file.size,
      'completed'
    )

    res.status(201).send({ message: 'File uploaded successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: 'Request failed, please try again later.' })
  }
}

module.exports = {
  createMessage,
  getChatMessages,
  getNewMessages,
  deleteMessage,
  createFileTransferHistory,
  sendFile,
}
