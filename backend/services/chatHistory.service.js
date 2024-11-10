const messageModel = require("../models/message.model")
const chatModel = require("../models/chat.model")
const messageSocket = require("./socket.services/message")

class ChatHistoryService {
  createSystemMessage = async (chat, content) => {
    try {
      const newMessage = new messageModel({
        chatId: chat._id,
        senderId: null,
        content,
        type: "system",
        status: "completed",
        readerIds: [],
      })
      await newMessage.save()
      messageSocket.sendMessage(
        newMessage?._doc,
        chat.members.map((member) => member.toString())
      )
    } catch (err) {
      console.error(err)
    }
  }

  createFileTransferHistory = async (
    chatId,
    senderId,
    fileName,
    fileSize,
    status
  ) => {
    try {
      const chat = await chatModel.findById(chatId)
      if (!chat) {
        console.log("Chat not found !")
        return
      }
      const newMessage = new messageModel({
        chatId,
        senderId,
        content: fileName,
        type: "fileTransfer",
        status: status,
        size: fileSize,
        readerIds: [senderId],
      })
      await newMessage.save()
      messageSocket.sendMessage(
        newMessage._doc,
        chat.members.map((member) => member.toString())
      )
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = new ChatHistoryService()
