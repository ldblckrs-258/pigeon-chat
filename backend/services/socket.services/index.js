const fileTransferSocket = require("./fileTransfer")
const messageSocket = require("./message")
class SocketServices {
  config = {
    cors: {
      origin: "*",
    },
  }
  connection(socket) {
    socket.on("online", (userId) => {
      if (userId) {
        _onlineUsers = _onlineUsers.filter((u) => u.userId !== userId)
        _onlineUsers.push({
          userId,
          socketId: socket.id,
        })
      }
      _io.emit(
        "getOnlineUsers",
        _onlineUsers.map((u) => u.userId)
      )
      console.log(_onlineUsers)
    })
    socket.on("disconnect", () => {
      _onlineUsers = _onlineUsers.filter((u) => u.socketId !== socket.id)
      _io.emit(
        "getOnlineUsers",
        _onlineUsers.map((u) => u.userId)
      )
      console.log(_onlineUsers)
    })

    messageSocket.handler(socket)
    fileTransferSocket.handler(socket)

    socket.on("error", (err) => {
      console.error(err)
    })
  }
}

module.exports = new SocketServices()
