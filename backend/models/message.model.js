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
      enum: [
        "text",
        "image",
        "system",
        "emoji",
        "fileTransfer",
        "voiceCall",
        "videoCall",
      ],
      default: "text",
    },
    status: {
      type: String,
      enum: ["pending", "cancelled", "completed"],
      default: "pending",
    },
    size: {
      type: Number,
      default: 0,
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
