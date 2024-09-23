import handleFileTransfer from './file-transfer/index.js'
const onlineUsers = new Set()

const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id)
    onlineUsers.add(socket.id)
    io.emit('onlineUsers', Array.from(onlineUsers))

    // Handle custom events
    socket.on('message', (data) => {
      console.log('Message received:', data)
      // send message to last user in onlineUsers
      const lastUser = Array.from(onlineUsers).pop()
      io.to(lastUser).emit('message', data)
    })

    handleFileTransfer(socket)

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id)
      onlineUsers.delete(socket.id)
    })
  })
}

export default handleSocketConnection
