const express = require('express')
const callingController = require('../controllers/calls.controller')
const { authenticate, simpleAuth } = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/voice/start', authenticate, callingController.startVoiceCall)
router.post('/voice/end', simpleAuth, callingController.endVoiceCall)

module.exports = router
