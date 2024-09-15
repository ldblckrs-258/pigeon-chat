import mongoose from 'mongoose'

export const CHAT_ROOM_TYPES = {
  PRIVATE: 'private',
  GROUP: 'group'
}

const chatRoomSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(CHAT_ROOM_TYPES),
    default: CHAT_ROOM_TYPES.PRIVATE
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  owners: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema)

export default ChatRoom
