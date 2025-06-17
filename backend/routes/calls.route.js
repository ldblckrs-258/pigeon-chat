const express = require('express')
const callingController = require('../controllers/calls.controller')
const { authenticate, simpleAuth } = require('../middlewares/auth.middleware')
const { validate } = require('../middlewares/validation.middleware')
const { startVoiceCallSchema, endVoiceCallSchema } = require('../schemas/call.schema')

const router = express.Router()

router.post(
  '/voice/start',
  authenticate,
  validate(startVoiceCallSchema),
  callingController.startVoiceCall
)
router.post('/voice/end', simpleAuth, validate(endVoiceCallSchema), callingController.endVoiceCall)

module.exports = router
