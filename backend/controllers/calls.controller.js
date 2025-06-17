const callsService = require('../services/calls.service')
const voiceCallSocket = require('../services/socket.services/voiceCall')
const { StatusCodes } = require('http-status-codes')
const catchAsync = require('../utils/catchAsync')

/**
 * Initiates a voice call in a specific chat.
 */
const startVoiceCall = catchAsync(async (req, res) => {
  const userId = req.user._id
  const userName = req.user.name
  const chatId = req.body.chatId

  const { chat, receivers } = await callsService.startVoiceCall(chatId, userId, userName)

  voiceCallSocket.voiceCallStart(chatId, receivers)

  res.status(StatusCodes.OK).send({ status: 'success', message: 'Voice call started' })
})

/**
 * Ends an ongoing voice call in a specific chat.
 */
const endVoiceCall = catchAsync(async (req, res) => {
  const userId = req.user._id
  const chatId = req.body.chatId

  const { chat, receivers } = await callsService.endVoiceCall(chatId, userId)

  voiceCallSocket.voiceCallEnd(chatId, receivers)

  res.status(StatusCodes.OK).send({ status: 'success', message: 'Voice call ended' })
})

module.exports = {
  startVoiceCall,
  endVoiceCall,
}
