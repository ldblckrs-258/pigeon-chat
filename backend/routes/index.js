const express = require('express')
const router = express.Router()

const { messageLimiter, uploadLimiter } = require('../middlewares/rateLimiter.middleware')

// Apply specific rate limiters to different routes
router.use('/auth', require('./auth.route'))
router.use('/chats', require('./chat.route'))
router.use('/messages', messageLimiter, require('./message.route'))
router.use('/tools', uploadLimiter, require('./tool.route'))
router.use('/users', require('./user.route'))
router.use('/calls', require('./calls.route'))
router.use('/friendships', require('./friendship.route'))

module.exports = router
