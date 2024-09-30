const express = require("express")
const userController = require("../Controllers/userController")
const router = express.Router()

router.get("/get", userController.getUser)
router.get("/all", userController.getUsers)
router.get("/find", userController.findUserByEmail)

module.exports = router
