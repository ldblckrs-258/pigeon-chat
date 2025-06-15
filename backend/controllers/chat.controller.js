const chatService = require('../services/chat.service')
const messageSocket = require('../services/socket.services/message')
const { StatusCodes } = require('http-status-codes')
const catchAsync = require('../utils/catchAsync')

/**
 * Creates a new chat with specified members.
 */
const createChat = catchAsync(async (req, res) => {
  const userId = req.user._id
  const members = req.body.members

  const newChat = await chatService.createChat(userId, members)

  const allMembers = newChat.members.map(member => member.toString())
  messageSocket.joinChat(allMembers)

  res.status(StatusCodes.CREATED).send({
    status: 'success',
    message: 'Chat created successfully',
    chatId: newChat._id,
  })
})

/**
 * Retrieves all chats for a user with optional search functionality.
 */
const findUserChats = catchAsync(async (req, res) => {
  const userId = req.user._id
  const search = req.query.search

  const chats = await chatService.findUserChats(userId, search)

  res.status(StatusCodes.OK).send({
    status: 'success',
    message: 'Chats retrieved successfully',
    data: chats,
  })
})

/**
 * Retrieves detailed information about a specific chat.
 */
const getChat = catchAsync(async (req, res) => {
  const userId = req.user._id
  const chatId = req.params.id
  const chat = await chatService.getChatById(chatId, userId)

  res.status(StatusCodes.OK).send({
    status: 'success',
    message: 'Chat information retrieved successfully',
    data: chat,
  })
})

/**
 * Adds new members to an existing chat.
 */
const addMembers = catchAsync(async (req, res) => {
  const userId = req.user._id
  const chatId = req.body.chatId
  const members = req.body.members

  const { chat, addedMembers } = await chatService.addMembersToChat(chatId, userId, members)

  messageSocket.updateChat(
    chatId,
    chat.members.map(member => member.toString())
  )

  res.status(StatusCodes.OK).send({
    status: 'success',
    message: 'Members added successfully',
  })
})

/**
 * Allows a user to leave a chat.
 */
const leaveChat = catchAsync(async (req, res) => {
  const chatId = req.params.id
  const userId = req.user._id

  const chat = await chatService.removeMemberFromChat(chatId, userId)

  messageSocket.updateChat(
    chatId,
    chat.members.map(member => member.toString())
  )
  messageSocket.outChat(chatId, [userId])

  res.status(StatusCodes.OK).send({ status: 'success', message: 'Chat left successfully' })
})

/**
 * Removes a member from a chat (admin function).
 */
const removeChatMember = catchAsync(async (req, res) => {
  const chatId = req.body.chatId
  const memberId = req.body.memberId
  const userId = req.user._id

  const chat = await chatService.removeMemberFromChat(chatId, memberId, userId)

  messageSocket.updateChat(
    chatId,
    chat.members.map(member => member.toString())
  )
  messageSocket.outChat(chatId, [memberId])

  res.status(StatusCodes.OK).send({ status: 'success', message: 'Member removed successfully' })
})

/**
 * Deletes a chat completely.
 */
const deleteChat = catchAsync(async (req, res) => {
  const userId = req.user._id
  const chatId = req.params.id

  const chat = await chatService.getChatById(chatId, userId)
  const members = chat.members.map(member => member._id.toString())

  await chatService.deleteChat(chatId, userId)

  messageSocket.outChat(chatId, members)

  res.status(StatusCodes.OK).send({ status: 'success', message: 'Chat deleted successfully' })
})

/**
 * Updates chat information such as name and avatar.
 */
const editChat = catchAsync(async (req, res) => {
  const chatId = req.body.chatId
  const { name, avatar } = req.body
  const userId = req.user._id

  const chat = await chatService.editChat(chatId, userId, { name, avatar })

  messageSocket.updateChat(
    chatId,
    chat.members.map(member => member.toString())
  )

  res.status(StatusCodes.OK).send({ status: 'success', message: 'Chat updated successfully' })
})

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
