class FriendshipSocket {
  handler(socket) {
    socket.on('sendFriendRequest', data => {
      const { userId, friendId } = data
      _io
        .to(_onlineUsers.find(u => u.userId === friendId)?.socketId)
        .emit('friendRequestReceived', { userId, friendId })
    })

    socket.on('acceptFriendRequest', data => {
      const { userId, friendId } = data
      _io
        .to(_onlineUsers.find(u => u.userId === friendId)?.socketId)
        .emit('friendRequestAccepted', { userId, friendId })
    })
  }

  notifyFriendRequest(friendId, name) {
    _io.to(_onlineUsers.find(u => u.userId === friendId)?.socketId).emit('friendRequest', name)
  }

  notifyFriendRequestAccepted(friendId, name) {
    _io
      .to(_onlineUsers.find(u => u.userId === friendId)?.socketId)
      .emit('friendRequestAccepted', name)
  }
}

module.exports = new FriendshipSocket()
