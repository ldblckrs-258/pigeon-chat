const socketio = require("socket.io")
require("dotenv").config()
const { handleSendMsg, handleUpdateChat } = require("./messageHandlers")

let io
let onlineUsers = []

module.exports = {
  init: (httpServer) => {
    io = socketio(httpServer, {
      cors: {
        origin: "*",
      },
    })

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`)
      socket.on("online", (userId) => {
        if (userId && !onlineUsers.some((u) => u.userId === userId)) {
          onlineUsers.push({
            userId,
            socketId: socket.id,
          })
        }
        io.emit(
          "getOnlineUsers",
          onlineUsers.map((u) => u.userId)
        )
      })
      socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id)
        io.emit(
          "getOnlineUsers",
          onlineUsers.map((u) => u.userId)
        )
        console.log(`Socket disconnected: ${socket.id}`)
      })
      socket.on("sendMsg", handleSendMsg(socket, io, onlineUsers))
      socket.on("updateChat", handleUpdateChat(socket, io, onlineUsers))

      socket.on("sendFileRequest", (metadata, receiverId) => {
        const receiver = onlineUsers.find((u) => u.userId === receiverId)
        if (receiver) {
          io.to(receiver.socketId).emit("fileTransferRequest", metadata)
          console.log(`fileTransferRequest to ${receiver.socketId}`)
        } else {
          socket.emit("fileTransferError", "The receiver is not online")
        }
      })
      socket.on("fileReceiveAccept", (senderId) => {
        const sender = onlineUsers.find((u) => u.userId === senderId)
        if (sender) {
          io.to(sender.socketId).emit("fileTransferAccept")
          console.log(`fileTransferAccept to ${sender.socketId}`)
        } else {
          socket.emit(
            "fileTransferError",
            "The sender has closed the connection"
          )
        }
      })
      socket.on("senderDesc", (desc, receiverId) => {
        const receiver = onlineUsers.find((u) => u.userId === receiverId)
        if (receiver) {
          io.to(receiver.socketId).emit("senderDesc", desc)
          console.log(`senderDesc to ${receiver.socketId}`)
        } else {
          socket.emit("fileTransferError", "The receiver is not online")
        }
      })
      socket.on("receiverDesc", (desc, senderId) => {
        const sender = onlineUsers.find((u) => u.userId === senderId)
        if (sender) {
          io.to(sender.socketId).emit("receiverDesc", desc)
          console.log(`receiverDesc to ${sender.socketId}`)
        } else {
          socket.emit(
            "fileTransferError",
            "The sender has closed the connection"
          )
        }
      })

      socket.on("ice-candidate", (candidate, targetId) => {
        const target = onlineUsers.find((u) => u.userId === targetId)
        if (target) {
          io.to(target.socketId).emit("ice-candidate", candidate)
          console.log(`ice-candidate to ${target.socketId}`)
        } else {
          socket.emit("fileTransferError", "The target is not online")
        }
      })

      socket.on("error", (err) => {
        console.error(err)
      })
    })

    return io
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!")
    }
    return io
  },
}
