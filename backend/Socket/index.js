const socketio = require("socket.io")
const { getTime } = require("../utils/Time")

let io
let onlineUsers = []

module.exports = {
  init: (httpServer) => {
    io = socketio(httpServer, {
      cors: {
        origin: process.env.ORIGIN || "http://localhost:3000",
      },
    })

    io.on("connection", (socket) => {
      socket.on("online", (userId) => {
        userId &&
          !onlineUsers.some((u) => u.userId === userId) &&
          onlineUsers.push({
            userId,
            socketId: socket.id,
          })
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
      })

      socket.on("sendMsg", (chatId, memberIds) => {
        const time = getTime()
        memberIds.forEach((id) => {
          const user = onlineUsers.find((u) => u.userId === id)
          const type = "message"
          user && io.to(user.socketId).emit("updated", type, time, chatId)
        })
      })

      socket.on("updateChat", (chatId, memberIds) => {
        const time = getTime()
        memberIds.forEach((id) => {
          const user = onlineUsers.find((u) => u.userId === id)
          const type = "chat"
          user && io.to(user.socketId).emit("updated", type, time, chatId)
        })
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
