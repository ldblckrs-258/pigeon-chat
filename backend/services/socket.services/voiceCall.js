const chatHistoryService = require("../chatHistory.service")
class VoiceCall {
  handler(socket) {
    socket.on("joinVoiceRoom", (chatId, userId) => {
      socket.join(chatId)
      const user = _onlineUsers.find((u) => u.userId === userId)

      const users = new Set([...this.callingUsers(chatId), user?.userId])
      const userIds = [...users].filter(Boolean)

      socket.emit("callingUsers", userIds)
      socket.to(chatId).emit("callingUsers", userIds)
    })

    socket.on("getCallingUsers", (chatId) => {
      const users = this.callingUsers(chatId)
      socket.emit("callingUsers", users)
    })

    socket.on("leaveVoiceRoom", (chatId) => {
      socket.leave(chatId)
      const user = _onlineUsers.find((u) => u.socketId === socket.id)
      if (!user) return
      const room = _io.sockets.adapter.rooms.get(chatId)
      if (!room || room.size === 0) {
        this.voiceCallEnd(chatId)
      } else {
        const users = new Set()
        for (let id of room) {
          const u = _onlineUsers.find((u) => u.socketId === id)
          if (u) {
            users.add(u.userId)
          }
        }
        users.delete(user.userId)
        socket.to(chatId).emit("callingUsers", [...users])
      }
    })

    socket.on("audioStream", (chatId, stream) => {
      socket.to(chatId).emit("audioStream", stream)
    })

    socket.on("channel-ice-candidate", (chatId, candidate, userId) => {
      socket.to(chatId).emit("channel-ice-candidate", candidate, userId)
    })

    socket.on("offer", (chatId, offer, userId) => {
      socket.to(chatId).emit("offer", offer, userId)
    })

    socket.on("answer", (chatId, answer, userId) => {
      socket.to(chatId).emit("answer", answer, userId)
    })
  }

  voiceCallStart(chatId, memberIds) {
    let receiver = _onlineUsers.filter((u) => memberIds.includes(u.userId))
    if (receiver.length === 0) return
    receiver.forEach((r) => {
      _io.to(r.socketId).emit("voiceCallStart", chatId)
    })
  }

  voiceCallEnd(chatId, receiverIds) {
    _io.to(chatId).emit("voiceCallEnd")
    chatHistoryService.endCalling(chatId)
    if (receiverIds?.length == 1) {
      const receiver = _onlineUsers.find((u) => u.userId === receiverIds[0])
      if (receiver) {
        _io.to(receiver.socketId).emit("voiceCallEnd", chatId)
      }
    }
  }

  callingUsers(chatId) {
    const room = _io.sockets.adapter.rooms.get(chatId)
    const users = []
    if (room)
      for (let id of room) {
        const user = _onlineUsers.find((u) => u.socketId === id)
        if (user) {
          users.push(user.userId)
        }
      }
    return users
  }
}

module.exports = new VoiceCall()
