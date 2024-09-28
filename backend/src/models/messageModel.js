import mongoose from 'mongoose'

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  EMOJI: 'emoji',
  SYSTEM: 'system',
  FILE_HISTORY: 'file_history',
  VOICE_HISTORY: 'voice_history'
}

const messageSchema = new mongoose.Schema(
  {
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom'
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: Object.values(MESSAGE_TYPES),
      default: MESSAGE_TYPES.TEXT
    },
    content: {
      type: String
    },
    file: {
      type: {
        path: String,
        size: Number
      }
    },
    voice_call: {
      type: {
        duration: Number
      }
    }
  },
  { timestamps: true }
)

const Message = mongoose.model('Message', messageSchema)

export default Message
