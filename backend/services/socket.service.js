const { getTime } = require("../utils/time.util")
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

    socket.on("sendFileRequest", (metadata, receiverId) => {
      const senderId = _onlineUsers.find(
        (u) => u.socketId === socket.id
      )?.userId
      if (!senderId) {
        socket.emit("fileTransferError", "You are using more than one device")
        return
      }
      const receiver = _onlineUsers.find((u) => u.userId === receiverId)
      if (receiver) {
        _io
          .to(receiver.socketId)
          .emit("fileTransferRequest", metadata, senderId)
        console.log(`fileTransferRequest to ${receiver.socketId}`)
      } else {
        socket.emit("fileTransferError", "The receiver is not online")
      }
    })
    socket.on("fileReceiveAccept", (senderId) => {
      const sender = _onlineUsers.find((u) => u.userId === senderId)
      if (sender) {
        _io.to(sender.socketId).emit("fileTransferAccept")
      } else {
        socket.emit("fileTransferError", "The sender has closed the connection")
      }
    })
    socket.on("senderDesc", (desc, receiverId) => {
      const receiver = _onlineUsers.find((u) => u.userId === receiverId)
      if (receiver) {
        _io.to(receiver.socketId).emit("senderDesc", desc)
      } else {
        socket.emit("fileTransferError", "The receiver is not online")
      }
    })
    socket.on("receiverDesc", (desc, senderId) => {
      const sender = _onlineUsers.find((u) => u.userId === senderId)
      if (sender) {
        _io.to(sender.socketId).emit("receiverDesc", desc)
      } else {
        socket.emit("fileTransferError", "The sender has closed the connection")
      }
    })

    socket.on("ice-candidate", (candidate, targetId) => {
      const target = _onlineUsers.find((u) => u.userId === targetId)
      if (target) {
        _io.to(target.socketId).emit("ice-candidate", candidate)
      } else {
        socket.emit("fileTransferError", "The target is not online")
      }
    })

    socket.on("error", (err) => {
      console.error(err)
    })
  }
}

module.exports = new SocketServices()
