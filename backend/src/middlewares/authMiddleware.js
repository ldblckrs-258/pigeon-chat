import userService from '../services/userService.js'
import authService from '../services/authService.js'

const sendUnauthorizedResponse = (res, message = 'Unauthorized') => {
  res.status(401).json({ message })
}

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.token
  if (!token) {
    return sendUnauthorizedResponse(res, 'No token provided')
  }

  try {
    const payload = await authService.verifyJwt(token)
    if (!payload?._id) {
      return sendUnauthorizedResponse(res, 'Invalid token payload')
    }

    const user = await userService.getUserById(payload._id)
    if (!user) {
      return sendUnauthorizedResponse(res, 'User not found')
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendUnauthorizedResponse(res, 'Token has expired')
    }
    console.error('Error in authMiddleware:', error)
    return sendUnauthorizedResponse(res, 'Token verification failed')
  }
}
