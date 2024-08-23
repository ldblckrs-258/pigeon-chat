import cookieParser from '../utils/cookie-parser.js'
import { verifyJwt } from '../utils/jwt.js'
import User from '../models/userModel.js'
export const authMiddleware = async (req, res, next) => {
  const cookie = req.headers.cookie
  if (!cookie) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  const token = cookieParser(cookie, 'token')
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  try {
    const payload = verifyJwt(token, process.env.JWT_SECRET)
    const user = await User.findOne({ _id: payload.id }).select(
      '-hashPassword -salt'
    )
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    req.user = user
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  next()
}
