class FileTransfer {
  handler(socket) {
    socket.on('sendFileRequest', (metadata, receiverId) => {
      const senderId = _onlineUsers.find(u => u.socketId === socket.id)?.userId
      if (!senderId) {
        socket.emit('fileTransferError', 'You are using more than one device')
        return
      }
      const receiver = _onlineUsers.find(u => u.userId === receiverId)
      if (receiver) {
        _io.to(receiver.socketId).emit('fileTransferRequest', metadata, senderId)
      } else {
        socket.emit('fileTransferError', 'The receiver is not online')
      }
    })

    socket.on('fileReceiveAccept', senderId => {
      const sender = _onlineUsers.find(u => u.userId === senderId)
      if (sender) {
        _io.to(sender.socketId).emit('fileTransferAccept')
      } else {
        socket.emit('fileTransferError', 'The sender has closed the connection')
      }
    })

    socket.on('fileReceiveReject', senderId => {
      const sender = _onlineUsers.find(u => u.userId === senderId)
      if (sender) {
        _io.to(sender.socketId).emit('fileTransferReject')
      } else {
        socket.emit('fileTransferError', 'The sender has closed the connection')
      }
    })

    socket.on('senderDesc', (desc, receiverId) => {
      const receiver = _onlineUsers.find(u => u.userId === receiverId)
      if (receiver) {
        _io.to(receiver.socketId).emit('senderDesc', desc)
      } else {
        socket.emit('fileTransferError', 'The receiver is not online')
      }
    })

    socket.on('receiverDesc', (desc, senderId) => {
      const sender = _onlineUsers.find(u => u.userId === senderId)
      console.log('receiverDesc', sender)
      if (sender) {
        _io.to(sender.socketId).emit('receiverDesc', desc)
      } else {
        socket.emit('fileTransferError', 'The sender has closed the connection')
      }
    })

    socket.on('ice-candidate', (candidate, targetId) => {
      const target = _onlineUsers.find(u => u.userId === targetId)
      if (target) {
        _io.to(target.socketId).emit('ice-candidate', candidate)
      } else {
        socket.emit('fileTransferError', 'The target is not online')
      }
    })

    socket.on('fileTransferCancel', targetId => {
      const target = _onlineUsers.find(u => u.userId === targetId)
      if (target) {
        _io.to(target.socketId).emit('fileTransferCancel')
      }
    })
  }
}

module.exports = new FileTransfer()
