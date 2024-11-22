const express = require("express")
const authController = require("../controllers/auth.controller")
const authenticate = require("../middlewares/auth.middleware")
const router = express.Router()

router.get("/", authenticate, authController.myAccount)
router.post("/register", authController.register)
router.post("/login", authController.login)
router.get("/logout", authController.logout)
router.put("/update/password", authenticate, authController.changePassword)
router.put("/update/info", authenticate, authController.updateInfo)
router.post("/google", authController.googleLogin)

module.exports = router
