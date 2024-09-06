import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  hashPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkVZoGW3vdRhfccLRhRbX_7DjzBqF0w6SB5g&s'
  },
  isVerified: {
    type: Boolean,
    default: false
  }
})

const User = mongoose.model('User', userSchema)

export default User
