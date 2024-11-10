const chatModel = require("../models/chat.model")
const chatHistoryService = require("../services/chatHistory.service")
const voiceCallSocket = require("../services/socket.services/voiceCall")

const startVoiceCall = async (req, res) => {
  const userId = req.user._id
  const userName = req.user.name
  const chatId = req.body.chatId

  try {
    const chat = await chatModel.findOne({
      _id: chatId,
      members: { $in: [userId] },
    })

    if (!chat) {
      return res.status(404).send({ message: "Chat not found" })
    }

    if (chat.calling) {
      return res.status(400).send({ message: "Chat is already in a call" })
    }
    chat.calling = "voice"
    await chat.save()

    chatHistoryService.createSystemMessage(
      chat,
      `${userName} started a voice call`
    )
    voiceCallSocket.voiceCallStart(chatId, chat.members)

    res.status(200).send({ message: "Voice call started" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Request failed, please try again later." })
  }
}

const endVoiceCall = async (req, res) => {
  const userId = req.user._id
  const chatId = req.body.chatId

  try {
    const chat = await chatModel.findOne({
      _id: chatId,
      members: { $in: [userId] },
    })

    if (!chat) {
      return res.status(404).send({ message: "Chat not found" })
    }

    if (!chat.calling) {
      return res.status(400).send({ message: "Chat is not in a call" })
    }
    chat.calling = null
    await chat.save()

    chatHistoryService.createSystemMessage(chat, "Voice call ended")
    voiceCallSocket.voiceCallEnd(chatId, chat.members)

    res.status(200).send({ message: "Voice call ended" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Request failed, please try again later." })
  }
}

module.exports = {
  startVoiceCall,
  endVoiceCall,
}
