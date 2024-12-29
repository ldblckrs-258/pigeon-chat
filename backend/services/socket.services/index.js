const fileTransferSocket = require("./fileTransfer")
const messageSocket = require("./message")
const voiceCallSocket = require("./voiceCall")
const friendshipSocket = require("./friendship")

class SocketServices {
  config = {
    cors: {
      origin: "*",
    },
  }
  connection(socket) {
    socket.on("online", (userId) => {
      if (userId && !_onlineUsers.some((u) => socket.id === u.socketId)) {
        _onlineUsers.push({ userId, socketId: socket.id })
      }
      const userIds = [...new Set(_onlineUsers.map((u) => u.userId))]
      _io.emit("getOnlineUsers", userIds)
    })
    socket.on("disconnect", () => {
      _onlineUsers = _onlineUsers.filter((u) => u.socketId !== socket.id)
      _io.emit(
        "getOnlineUsers",
        _onlineUsers.map((u) => u.userId)
      )
    })

    messageSocket.handler(socket)
    fileTransferSocket.handler(socket)
    voiceCallSocket.handler(socket)
    friendshipSocket.handler(socket)

    socket.on("error", (err) => {
      console.error(err)
    })
  }
}

module.exports = new SocketServices()
