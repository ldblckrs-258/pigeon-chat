const fileTransformSocket = require("./fileTransform")
const messageSocket = require("./message")
class SocketServices {
  config = {
    cors: {
      origin: "*",
    },
  }
  connection(socket) {
    socket.on("online", (userId) => {
      if (userId && !_onlineUsers.some((u) => u.userId === userId)) {
        _onlineUsers.push({
          userId,
          socketId: socket.id,
        })
      }
      _io.emit(
        "getOnlineUsers",
        _onlineUsers.map((u) => u.userId)
      )
    })
    socket.on("disconnect", () => {
      _onlineUsers = _onlineUsers.filter((u) => u.socketId !== socket.id)
      _io.emit(
        "getOnlineUsers",
        _onlineUsers.map((u) => u.userId)
      )
    })

    messageSocket.handler(socket)
    fileTransformSocket.handler(socket)

    socket.on("error", (err) => {
      console.error(err)
    })
  }
}

module.exports = new SocketServices()
