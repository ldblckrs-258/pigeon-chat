const messageModel = require("../models/message.model")
const chatModel = require("../models/chat.model")
const messageSocket = require("../services/socket.services/message")
const ChatHistoryService = require("../services/chatHistory.service")
const createMessage = async (req, res) => {
  const chatId = req.body.chatId
  const content = req.body.content
  const type = req.body.type || "text"

  try {
    const chatRoom = await chatModel.findById(chatId)
    if (!chatRoom) {
      return res.status(404).send({ message: "Chat not found" })
    }
    const newMessage = new messageModel({
      chatId,
      senderId: req.user._id,
      content,
      type,
      status: "completed",
      readerIds: [req.user._id],
    })

    const response = await newMessage.save()

    const memberIds = chatRoom.members.map((member) => {
      if (member.toString() !== req.user._id.toString())
        return member.toString()
    })

    let data = {
      ...response?._doc,
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
    res.status(500).send({ message: "Request failed, please try again later." })
  }
}

const getChatMessages = async (req, res) => {
  const userId = req.user._id
  const chatId = req.params.chatId
  const skip = parseInt(req.query.skip) || 0
  const limit = parseInt(req.query.limit) || 10

  try {
    const messages = await messageModel
      .find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-updatedAt -__v -chatId")
      .populate("senderId", "name avatar")

    if (!messages || messages?.length === 0)
      return res.status(200).send({
        message: "No messages found",
        data: [],
      })

    messages?.forEach((message) => {
      if (!message.readerIds.includes(userId)) {
        message.readerIds.push(userId)
        message.save()
      }
    })

    let modifiedMessages = messages?.map((message) => {
      let sender = null
      if (message.senderId) {
        sender = {
          isMine: message.senderId._id.toString() === userId.toString(),
          _id: message.senderId._id,
          name: message.senderId.name,
          avatar: message.senderId.avatar,
        }
      }

      return {
        _id: message._id,
        sender,
        content: message.content,
        type: message.type,
        size: message?.size || 0,
        status: message.status || "completed",
        createdAt: message.createdAt,
      }
    })

    res.status(200).send({
      message: "Messages retrieved successfully",
      data: modifiedMessages,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Request failed, please try again later." })
  }
}

const getNewMessages = async (req, res) => {
  const userId = req.user._id
  const chatId = req.params.chatId
  const lastMessageId = req.query.lastMessageId

  try {
    const lastMessage = await messageModel.findById(lastMessageId)
    if (!lastMessage) {
      return res.status(404).send({ message: "Message not found" })
    }

    const messages = await messageModel
      .find({ chatId, createdAt: { $gt: lastMessage.createdAt } })
      .select("-updatedAt -__v -chatId")
      .populate("senderId", "name avatar")

    if (!messages || messages.length === 0)
      return res.status(200).send({
        message: "No new messages found",
        data: [],
      })

    messages.forEach((message) => {
      if (!message.readerIds.includes(userId)) {
        message.readerIds.push(userId)
        message.save()
      }
    })

    let modifiedMessages = messages.map((message) => {
      let sender = null
      if (message.senderId) {
        sender = {
          isMine: message.senderId._id.toString() === userId.toString(),
          _id: message.senderId._id,
          name: message.senderId.name,
          avatar: message.senderId.avatar,
        }
      }

      return {
        _id: message._id,
        sender,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
      }
    })

    res.status(200).send({
      message: "New messages retrieved successfully",
      data: modifiedMessages,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Request failed, please try again later." })
  }
}

const deleteMessage = async (req, res) => {
  const userId = req.user._id
  const messageId = req.params.messageId

  try {
    const message = await messageModel.findById(messageId)
    if (!message) {
      return res.status(404).send({ message: "Message not found" })
    }
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).send({ message: "Unauthorized" })
    }

    await messageModel.findByIdAndDelete(messageId)
    res.status(200).send({ message: "Message deleted successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Request failed, please try again later." })
  }
}

const createFileTransferHistory = async (req, res) => {
  const chatId = req.body.chatId
  const senderId = req.body.senderId
  const fileName = req.body.fileName
  const fileSize = req.body.fileSize
  const status = req.body.status || "completed"

  try {
    await ChatHistoryService.createFileTransferHistory(
      chatId,
      senderId,
      fileName,
      fileSize,
      status
    )

    res
      .status(201)
      .send({ message: "File transfer history created successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Request failed, please try again later." })
  }
}

module.exports = {
  createMessage,
  getChatMessages,
  getNewMessages,
  deleteMessage,
  createFileTransferHistory,
}
