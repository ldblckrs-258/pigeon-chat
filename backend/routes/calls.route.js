const express = require("express")
const callingController = require("../controllers/calls.controller")
const authenticate = require("../middlewares/auth.middleware")

const router = express.Router()

router.post("/voice/start", authenticate, callingController.startVoiceCall)
router.post("/voice/end", authenticate, callingController.endVoiceCall)

module.exports = router
