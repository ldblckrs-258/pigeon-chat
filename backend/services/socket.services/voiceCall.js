class VoiceCall {
  handler(socket) {
    socket.on("joinVoiceRoom", (chatId, userId) => {
      const room = _io.sockets.adapter.rooms.get(chatId)
      const users = []
      if (room)
        for (let id of room) {
          const user = _onlineUsers.find((u) => u.socketId === id)
          if (user) {
            users.push(user.userId)
          }
        }

      if (users.includes(userId)) return

      socket.join(chatId)
      socket.to(chatId).emit("voiceCallUserJoined", userId)
    })

    socket.on("leaveVoiceRoom", (chatId) => {
      socket.leave(chatId)
      const user = _onlineUsers.find((u) => u.socketId === socket.id)
      if (!user) return
      socket.to(chatId).emit("voiceCallUserLeft", user.userId)

      const room = _io.sockets.adapter.rooms.get(chatId)
      if (!room || room.size === 0) {
        this.voiceCallEnd(chatId)
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

  voiceCallEnd(chatId) {
    _io.to(chatId).emit("voiceCallEnd")
  }
}

module.exports = new VoiceCall()
