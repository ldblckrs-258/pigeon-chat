const express = require("express")
const multer = require("multer")
const toolController = require("../controllers/tool.controller")
const authenticate = require("../middlewares/auth.middleware")

const router = express.Router()
const upload = multer({ dest: "uploads/" })

router.post(
  "/upload/image",
  authenticate,
  upload.single("image"),
  toolController.uploadImage
)

module.exports = router
