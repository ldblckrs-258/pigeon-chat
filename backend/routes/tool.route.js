const express = require('express')
const multer = require('multer')
const toolController = require('../controllers/tool.controller')
const { simpleAuth } = require('../middlewares/auth.middleware')

const router = express.Router()
const upload = multer({ dest: 'uploads/' })

router.post('/upload/image', simpleAuth, upload.single('image'), toolController.uploadImage)

/**
 * /api/tools/ice-servers
 * @param {string} type - The type of ICE servers to return
 * @type {string} - "free" | "metered" | "cloudflare" | "all"
 * @returns {Array<Object>} - An array of ICE servers
 */
router.get('/ice-servers', simpleAuth, toolController.getIceServers)

module.exports = router
