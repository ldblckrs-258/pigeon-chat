const chatModel = require("../models/chat.model")
const messageModel = require("../models/message.model")
const userModel = require("../models/user.model")
const chatHistoryService = require("../services/chatHistory.service")
const ObjectId = require("mongoose").Types.ObjectId
const messageSocket = require("../services/socket.services/message")

const createChat = async (req, res) => {
  const userId = req.user._id
  let members = req.body.members.map((member) => new ObjectId(member))
  members.push(userId)
  members = [...new Set(members)]

  try {
    const chat = await chatModel.findOne({
      members: { $eq: members },
    })

    if (chat) {
      return res.status(400).send({ message: "Chat already exists" })
    }

    let name = "New Chat"
    if (members.length > 2) {
      const users = await userModel
        .find({ _id: { $in: members } })
        .select("name")
      name = users.map((user) => user.name).join(", ")
    }

    const newChat = new chatModel({
      members: members,
      name: name,
    })

    await newChat.save()

    messageSocket.joinChat(members.map((member) => member.toString()))

    res.status(201).send({
      message: "Chat created successfully",
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Request failed, please try again later." })
  }
}

const findUserChats = async (req, res) => {
  const userId = req.user._id
  const search = req.query.search

  try {
    let chats = await chatModel
      .find({
        members: { $in: [userId] },
      })
      .select("-createdAt -updatedAt -__v")
      .populate("members", "_id avatar name")

    if (!chats || chats.length === 0) {
      return res.status(200).send([])
    }

    if (search) {
      chats = chats.filter((chat) => {
        if (chat.name.toLowerCase().includes(search.toLowerCase())) {
          return true
        }
        for (let member of chat.members) {
          if (member.name.toLowerCase().includes(search.toLowerCase())) {
            return true
          }
        }
        return false
      })
    }

    let outputChat = []
    for (let chat of chats) {
      const lastMessage = await messageModel
        .findOne({ chatId: chat._id })
        .sort({ createdAt: -1 })
        .limit(1)
        .select("senderId content createdAt readerIds type")
      let modifiedChat = {
        _id: chat._id,
        name: chat.name,
        avatar: chat.avatar,
        lastMessage: "No messages yet",
        lastTime: chat.createdAt,
        isMyMessage: false,
        read: true,
        isGroup: chat.members.length != 2,
        members: chat.members
          .filter((member) => member._id.toString() !== userId.toString())
          .map((member) => member._id),
      }

      if (!modifiedChat.isGroup) {
        chat.members = chat.members.filter(
          (member) => member._id.toString() !== userId.toString()
        )
        const user = await userModel
          .findById(chat.members[0])
          .select("name avatar")
        modifiedChat.avatar = user.avatar
        modifiedChat.name = user.name
      }
      if (lastMessage) {
        modifiedChat.lastTime = lastMessage.createdAt
        modifiedChat.lastMessage =
          lastMessage.type === "image" ? "📷 Image" : lastMessage.content
        modifiedChat.isMyMessage =
          lastMessage.senderId?.toString() === userId.toString()
        modifiedChat.read = lastMessage.readerIds
          .map((objId) => objId.toString())
          .includes(userId.toString())
      } else {
        modifiedChat.lastTime = chat.createdAt
      }
      outputChat.push(modifiedChat)
    }

    res.status(200).send(outputChat)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Request failed, please try again later." })
  }
}

const getChat = async (req, res) => {
  const userId = req.user._id
  const chatId = req.params.id

  try {
    let chat = await chatModel
      .findOne({
        _id: chatId,
        members: { $in: [userId] },
      })
      .select("-createdAt -updatedAt -__v")
      .populate("members", "name avatar")

    if (!chat) {
      return res.status(404).send({ message: "Chat not found" })
    }

    let modifiedChat = {
      _id: chat._id,
      name: chat.name,
      avatar: chat.avatar,
      members: chat.members,
      isGroup: chat.members.length != 2,
    }

    if (!modifiedChat.isGroup) {
      chat.members = chat.members.filter(
        (member) => member._id.toString() !== userId.toString()
      )
      const user = await userModel.findById(chat.members[0]).select("avatar")
      modifiedChat.avatar = user.avatar
      modifiedChat.name = chat.members[0].name
    }

    res.status(200).send({
      message: "Chat information retrieved successfully",
      data: modifiedChat,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Chat not found" })
  }
}

const addMembers = async (req, res) => {
  const userId = req.user._id
  const chatId = req.body.chatId
  let members = req.body.members.map((member) => new ObjectId(member))

  try {
    const chat = await chatModel.findOne({
      _id: chatId,
      members: { $in: [userId] },
    })

    if (!chat) {
      return res.status(404).send({ message: "Chat not found" })
    }

    members = members.filter(
      (member) =>
        !chat.members
          .map((member) => member.toString())
          .includes(member.toString())
    )
    chat.members = [...chat.members, ...members]
    await chat.save()

    const user = await userModel.findById(userId).select("name")
    const addedMembers = await userModel
      .find({ _id: { $in: members } })
      .select("name")

    chatHistoryService.createSystemMessage(
      chat,
      `${user.name} added ${addedMembers
        .map((member) => member.name)
        .join(", ")} to chat`
    )
    messageSocket.updateChat(
      chatId,
      chat.members.map((member) => member.toString())
    )

    res.status(200).send({ message: "Members added successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Chat not found" })
  }
}

const removeMember = async (chatId, targetId, userId) => {
  let chat
  if (userId || userId !== targetId) {
    chat = await chatModel.findOne({
      _id: chatId,
      members: { $in: [targetId, userId] },
    })
  } else {
    chat = await chatModel.findOne({
      _id: chatId,
      members: { $in: [targetId] },
    })
  }

  if (!chat) {
    return false
  }

  let members = chat.members
  messageSocket.updateChat(
    chatId,
    members.map((member) => member.toString())
  )
  members = members.filter(
    (member) => member.toString() !== targetId.toString()
  )
  chat.members = members
  messageSocket.outChat(chatId, [targetId])

  return await chat.save()
}

const leaveChat = async (req, res) => {
  const chatId = req.params.id

  try {
    const chat = await removeMember(chatId, req.user?._id)

    if (!chat) {
      return res.status(404).send({ message: "Chat not found" })
    }

    chatHistoryService.createSystemMessage(chat, `${req.user?.name} left chat`)

    res.status(200).send({ message: "Chat left successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Error occurred while leaving chat" })
  }
}

const removeChatMember = async (req, res) => {
  const chatId = req.body.chatId
  const memberId = req.body.memberId
  try {
    const chat = await removeMember(chatId, memberId, req.user._id)
    if (!chat) {
      return res.status(404).send({ message: "Chat not found" })
    }

    const target = await userModel.findById(memberId).select("name")

    chatHistoryService.createSystemMessage(
      chat,
      `${req.user?.name} removed ${target.name} from chat`
    )

    res.status(200).send({ message: "Member removed successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Error occurred while removing member" })
  }
}

const deleteChat = async (req, res) => {
  const userId = req.user._id
  const chatId = req.params.id

  try {
    const chat = await chatModel.findOne({
      _id: chatId,
      members: { $in: [userId] },
    })
    const members = chat.members.map((member) => member.toString())

    if (!chat) {
      return res.status(404).send({ message: "Chat not found" })
    }

    await chatModel.findByIdAndDelete(chatId)
    await messageModel.deleteMany({ chatId: chatId })

    messageSocket.outChat(chatId, members)

    res.status(200).send({ message: "Chat deleted successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Chat not found" })
  }
}

const editChat = async (req, res) => {
  const chatId = req.body.chatId
  const name = req.body.name
  const avatar = req.body.avatar

  try {
    const chat = await chatModel.findOne({
      _id: chatId,
      members: { $in: [req.user?._id] },
    })

    if (!chat) {
      return res.status(404).send({ message: "Chat not found" })
    }

    chat.name = name
    chat.avatar = avatar
    await chat.save()

    chatHistoryService.createSystemMessage(
      chat,
      `${req.user?.name} changed chat info`
    )

    messageSocket.updateChat(
      chatId,
      chat.members.map((member) => member.toString())
    )

    res.status(200).send({ message: "Chat updated successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Chat not found" })
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
