import cookieParser from '../utils/cookie-parser.js'
export const userMiddleware = (req, res, next) => {
  // get cookie
  const cookie = req.headers.cookie
  if (!cookie) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  // parse cookie
  const token = cookieParser(cookie, 'token')
  console.log(token)
  next()
}
