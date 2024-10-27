const { getTime } = require("../../utils/time.util")

class Message {
  handler(socket) {
    socket.on("sendMsg", (chatId, memberIds) => {
      const time = getTime()
      memberIds.forEach((id) => {
        const user = _onlineUsers.find((u) => u.userId === id)
        const type = "message"
        if (user) {
          _io.to(user.socketId).emit("updated", type, time, chatId)
        }
      })
    })
    socket.on("updateChat", (chatId, memberIds) => {
      const time = getTime()
      memberIds.forEach((id) => {
        const user = _onlineUsers.find((u) => u.userId === id)
        const type = "chat"
        if (user) {
          _io.to(user.socketId).emit("updated", type, time, chatId)
        }
      })
    })
  }
  sendMessage(data, memberIds) {
    let receivers = _onlineUsers.filter((u) => memberIds.includes(u.userId))
    if (receivers.length === 0) return
    receivers.forEach((r) => {
      _io.to(r.socketId).emit("newMessage", {
        ...data,
        sender: {
          ...data.sender,
          _id: data.senderId,
          isMine: data.senderId.toString() === r.userId,
        },
      })
    })
  }

  updateChat(chatId, memberIds) {
    let receiverIds = _onlineUsers
      .filter((u) => memberIds.includes(u.userId))
      .map((u) => u.socketId)
    if (receiverIds.length === 0) return
    receiverIds.forEach((id) => {
      _io.to(id).emit("updateChat", chatId)
    })
  }

  joinChat(memberIds) {
    let receiverIds = _onlineUsers
      .filter((u) => memberIds.includes(u.userId))
      .map((u) => u.socketId)
    if (receiverIds.length === 0) return
    receiverIds.forEach((id) => {
      _io.to(id).emit("joinChat")
    })
  }

  outChat(chatId, memberIds) {
    let receiverIds = _onlineUsers
      .filter((u) => memberIds.includes(u.userId))
      .map((u) => u.socketId)
    if (receiverIds.length === 0) return
    receiverIds.forEach((id) => {
      _io.to(id).emit("outChat", chatId)
    })
  }
}

module.exports = new Message()
