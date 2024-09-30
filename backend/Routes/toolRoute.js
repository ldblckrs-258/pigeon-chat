const express = require("express")
const multer = require("multer")
const toolController = require("../Controllers/toolController")
const authenticate = require("../Middlewares/authMiddleware")

const router = express.Router()
const upload = multer({ dest: "uploads/" })

router.post(
  "/upload/image",
  authenticate,
  upload.single("image"),
  toolController.uploadImage
)

module.exports = router
