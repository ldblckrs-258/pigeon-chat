const express = require('express')
const { simpleAuth } = require('../middlewares/auth.middleware')
const chatController = require('../controllers/chat.controller')

const router = express.Router()

router.post('/create', simpleAuth, chatController.createChat)
router.get('/all', simpleAuth, chatController.findUserChats)
router.get('/get/:id', simpleAuth, chatController.getChat)
router.post('/leave/:id', simpleAuth, chatController.leaveChat)
router.delete('/delete/:id', simpleAuth, chatController.deleteChat)
router.post('/members/add', simpleAuth, chatController.addMembers)
router.post('/members/remove', simpleAuth, chatController.removeChatMember)
router.post('/edit', simpleAuth, chatController.editChat)

module.exports = router
