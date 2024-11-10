const express = require("express")
const router = express.Router()

router.use("/auth", require("./auth.route"))
router.use("/chats", require("./chat.route"))
router.use("/messages", require("./message.route"))
router.use("/tools", require("./tool.route"))
router.use("/users", require("./user.route"))
router.use("/calls", require("./calls.route"))

module.exports = router
