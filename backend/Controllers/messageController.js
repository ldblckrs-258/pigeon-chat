const messageModel = require("../Models/messageModel")
const mediaService = require("../Services/mediaService")

const createMessage = async (req, res) => {
  const userId = req.user._id
  const chatId = req.body.chatId
  const content = req.body.content
  const type = req.body.type || "text"

  try {
    const newMessage = new messageModel({
      chatId,
      senderId: userId,
      content,
      type,
      readerIds: [userId],
    })

    const response = await newMessage.save()

    res.status(201).send({
      message: "Message sent successfully",
      message: response,
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

    if (!messages || messages.length === 0)
      return res.status(200).send({
        message: "No messages found",
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

const createSystemMessage = async (chatId, content) => {
  try {
    const newMessage = new messageModel({
      chatId,
      senderId: null,
      content,
      type: "system",
      readerIds: [],
    })

    await newMessage.save()
  } catch (err) {
    console.error(err)
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

module.exports = {
  createMessage,
  getChatMessages,
  getNewMessages,
  createSystemMessage,
  deleteMessage,
}
