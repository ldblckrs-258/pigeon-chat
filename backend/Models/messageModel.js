const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: String,
    type: {
      type: String,
      enum: ["text", "image", "system", "emoji"],
      default: "text",
    },
    readerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
)

const messageModel = mongoose.model("Message", messageSchema)

module.exports = messageModel
