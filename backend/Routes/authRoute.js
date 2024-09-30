const express = require("express")
const authController = require("../Controllers/authController")
const authenticate = require("../Middlewares/authMiddleware")
const router = express.Router()

router.get("/", authenticate, authController.myAccount)
router.post("/register", authController.register)
router.post("/login", authController.login)
router.get("/logout", authController.logout)
router.put("/update/password", authenticate, authController.changePassword)
router.put("/update/info", authenticate, authController.updateInfo)

module.exports = router
