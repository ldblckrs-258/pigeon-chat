import chatRoomService from '../services/chatRoomService.js'

const sendForbiddenResponse = (res, message = 'Forbidden') => {
  res.status(403).json({ message })
}

export const roomMemberMiddleware = async (req, res, next) => {
  const { user } = req
  const { roomId } = req.params
  const chatRoom = await chatRoomService.checkIsMember(roomId, user._id)
  if (!chatRoom) {
    return sendForbiddenResponse(res, 'You are not a member of this room')
  }

  req.chatRoom = chatRoom
  next()
}
