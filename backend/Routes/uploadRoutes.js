const express = require("express");
const router = express.Router();
const uploadController = require("../Controllers/uploadController");

// Route để upload file
router.post("/upload", uploadController.uploadFile);

module.exports = router;
