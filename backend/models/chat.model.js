const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    name: {
      type: String,
      default: "New Chat",
    },
    avatar: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/2352/2352167.png",
    },
    calling: {
      type: String,
      enum: ["voice", "video"],
      default: null,
    },
  },
  { timestamps: true }
)

const chatModel = mongoose.model("Chat", chatSchema)

module.exports = chatModel
