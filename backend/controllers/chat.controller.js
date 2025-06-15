const chatService = require('../services/chat.service')
const messageSocket = require('../services/socket.services/message')

/**
 * Creates a new chat with specified members.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string[]} req.body.members - Array of user IDs to include in the chat
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const createChat = async (req, res) => {
  const userId = req.user._id
  const members = req.body.members

  try {
    const newChat = await chatService.createChat(userId, members)

    const allMembers = newChat.members.map(member => member.toString())
    messageSocket.joinChat(allMembers)

    res.status(201).send({
      message: 'Chat created successfully',
      chatId: newChat._id,
    })
  } catch (err) {
    console.error(err)

    if (err.message === 'Chat already exists') {
      return res.status(400).send({ message: err.message, chatId: err.chatId })
    }

    res.status(500).send({ message: 'Request failed, please try again later.' })
  }
}

/**
 * Retrieves all chats for a user with optional search functionality.
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.search] - Search term to filter chats by name
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const findUserChats = async (req, res) => {
  const userId = req.user._id
  const search = req.query.search

  try {
    const chats = await chatService.findUserChats(userId, search)
    res.status(200).send(chats)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: 'Request failed, please try again later.' })
  }
}

/**
 * Retrieves detailed information about a specific chat.
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - ID of the chat to retrieve
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const getChat = async (req, res) => {
  const userId = req.user._id
  const chatId = req.params.id

  try {
    const chat = await chatService.getChatById(chatId, userId)

    res.status(200).send({
      message: 'Chat information retrieved successfully',
      data: chat,
    })
  } catch (err) {
    console.error(err)

    if (err.message === 'Chat not found') {
      return res.status(404).send({ message: err.message })
    }

    res.status(500).send({ message: 'Chat not found' })
  }
}

/**
 * Adds new members to an existing chat.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.chatId - ID of the chat to add members to
 * @param {string[]} req.body.members - Array of user IDs to add to the chat
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const addMembers = async (req, res) => {
  const userId = req.user._id
  const chatId = req.body.chatId
  const members = req.body.members

  try {
    const { chat, addedMembers } = await chatService.addMembersToChat(chatId, userId, members)

    messageSocket.updateChat(
      chatId,
      chat.members.map(member => member.toString())
    )

    res.status(200).send({ message: 'Members added successfully' })
  } catch (err) {
    console.error(err)

    if (err.message === 'Chat not found') {
      return res.status(404).send({ message: err.message })
    }

    res.status(500).send({ message: 'Chat not found' })
  }
}

/**
 * Allows a user to leave a chat.
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - ID of the chat to leave
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const leaveChat = async (req, res) => {
  const chatId = req.params.id
  const userId = req.user._id

  try {
    const chat = await chatService.removeMemberFromChat(chatId, userId)

    messageSocket.updateChat(
      chatId,
      chat.members.map(member => member.toString())
    )
    messageSocket.outChat(chatId, [userId])

    res.status(200).send({ message: 'Chat left successfully' })
  } catch (err) {
    console.error(err)

    if (err.message === 'Chat not found') {
      return res.status(404).send({ message: err.message })
    }

    res.status(500).send({ message: 'Error occurred while leaving chat' })
  }
}

/**
 * Removes a member from a chat (admin function).
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.chatId - ID of the chat to remove member from
 * @param {string} req.body.memberId - ID of the member to remove
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const removeChatMember = async (req, res) => {
  const chatId = req.body.chatId
  const memberId = req.body.memberId
  const userId = req.user._id

  try {
    const chat = await chatService.removeMemberFromChat(chatId, memberId, userId)

    messageSocket.updateChat(
      chatId,
      chat.members.map(member => member.toString())
    )
    messageSocket.outChat(chatId, [memberId])

    res.status(200).send({ message: 'Member removed successfully' })
  } catch (err) {
    console.error(err)

    if (err.message === 'Chat not found') {
      return res.status(404).send({ message: err.message })
    }

    res.status(500).send({ message: 'Error occurred while removing member' })
  }
}

/**
 * Deletes a chat completely.
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - ID of the chat to delete
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const deleteChat = async (req, res) => {
  const userId = req.user._id
  const chatId = req.params.id

  try {
    // Get chat members before deletion for socket notification
    const chat = await chatService.getChatById(chatId, userId)
    const members = chat.members.map(member => member._id.toString())

    await chatService.deleteChat(chatId, userId)

    messageSocket.outChat(chatId, members)

    res.status(200).send({ message: 'Chat deleted successfully' })
  } catch (err) {
    console.error(err)

    if (err.message === 'Chat not found') {
      return res.status(404).send({ message: err.message })
    }

    res.status(500).send({ message: 'Chat not found' })
  }
}

/**
 * Updates chat information such as name and avatar.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.chatId - ID of the chat to edit
 * @param {string} [req.body.name] - New name for the chat
 * @param {string} [req.body.avatar] - New avatar URL for the chat
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const editChat = async (req, res) => {
  const chatId = req.body.chatId
  const { name, avatar } = req.body
  const userId = req.user._id

  try {
    const chat = await chatService.editChat(chatId, userId, { name, avatar })

    messageSocket.updateChat(
      chatId,
      chat.members.map(member => member.toString())
    )

    res.status(200).send({ message: 'Chat updated successfully' })
  } catch (err) {
    console.error(err)

    if (err.message === 'Chat not found') {
      return res.status(404).send({ message: err.message })
    }

    res.status(500).send({ message: 'Chat not found' })
  }
}

module.exports = {
  createChat,
  findUserChats,
  getChat,
  leaveChat,
  deleteChat,
  addMembers,
  removeChatMember,
  editChat,
}
