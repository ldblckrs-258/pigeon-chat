import handleFileTransfer from './file-transfer/index.js'
const onlineUsers = new Set()

const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id)
    onlineUsers.add(socket.id)
    io.emit('onlineUsers', 'Su kien online user')

    handleFileTransfer(socket)

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id)
      onlineUsers.delete(socket.id)
    })
  })
}

export default handleSocketConnection
