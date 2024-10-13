handleFileTransferRequest =
  (socket, io, onlineUsers) => (metadata, receiverId) => {
    const sender = onlineUsers.find((u) => u.socketId === socket.id)
    const receiver = onlineUsers.find((u) => u.userId === receiverId)
    if (receiver) {
      io.to(receiver.socketId).emit(
        "file-transfer-request",
        metadata,
        sender.userId
      )
    } else {
      socket.emit("file-transfer-error", "The receiver is not online")
    }
  }

handleFileReceiveAccept = (socket, io, onlineUsers) => (senderId) => {
  const sender = onlineUsers.find((u) => u.userId === senderId)
  if (sender) {
    io.to(sender.socketId).emit("file-transfer-accept")
  } else {
    socket.emit("file-transfer-error", "The sender has closed the connection")
  }
}

handleSenderDesc = (socket, io, onlineUsers) => (desc, receiverId) => {
  const sender = onlineUsers.find((u) => u.socketId === socket.id)
  const receiver = onlineUsers.find((u) => u.userId === receiverId)
  if (receiver) {
    io.to(receiver.socketId).emit("sender-desc", desc, sender.userId)
  } else {
    socket.emit("file-transfer-error", "The receiver is not online")
  }
}

handleReceiverDesc = (socket, io, onlineUsers) => (desc, senderId) => {
  const sender = onlineUsers.find((u) => u.userId === senderId)
  if (sender) {
    io.to(sender.socketId).emit("receiver-desc", desc)
  } else {
    socket.emit("file-transfer-error", "The sender has closed the connection")
  }
}

module.exports = {
  handleFileTransferRequest,
  handleFileReceiveAccept,
  handleSenderDesc,
  handleReceiverDesc,
}
