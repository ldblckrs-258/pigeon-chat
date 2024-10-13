const { getTime } = require("../utils/Time")

const handleSendMsg = (socket, io, onlineUsers) => (chatId, memberIds) => {
  const time = getTime()
  memberIds.forEach((id) => {
    const user = onlineUsers.find((u) => u.userId === id)
    const type = "message"
    if (user) {
      io.to(user.socketId).emit("updated", type, time, chatId)
    }
  })
}

const handleUpdateChat = (socket, io, onlineUsers) => (chatId, memberIds) => {
  const time = getTime()
  memberIds.forEach((id) => {
    const user = onlineUsers.find((u) => u.userId === id)
    const type = "chat"
    if (user) {
      io.to(user.socketId).emit("updated", type, time, chatId)
    }
  })
}

module.exports = {
  handleSendMsg,
  handleUpdateChat,
}
