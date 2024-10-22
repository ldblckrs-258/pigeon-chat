const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
    },
    avatar: {
      type: String,
      default:
        "https://static-00.iconduck.com/assets.00/avatar-default-icon-1024x1024-dvpl2mz1.png",
    },
    email: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 1024,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
)

const userModel = mongoose.model("User", userSchema)

module.exports = userModel
