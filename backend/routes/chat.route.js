const express = require('express')
const { simpleAuth } = require('../middlewares/auth.middleware')
const { validate } = require('../middlewares/validation.middleware')
const chatController = require('../controllers/chat.controller')
const {
  createChatSchema,
  findUserChatsSchema,
  getChatSchema,
  addMembersSchema,
  leaveChatSchema,
  removeChatMemberSchema,
  deleteChatSchema,
  editChatSchema,
} = require('../schemas/chat.schema')

const router = express.Router()

router.post('/create', simpleAuth, validate(createChatSchema), chatController.createChat)
router.get('/all', simpleAuth, validate(findUserChatsSchema), chatController.findUserChats)
router.get('/get/:id', simpleAuth, validate(getChatSchema), chatController.getChat)
router.post('/leave/:id', simpleAuth, validate(leaveChatSchema), chatController.leaveChat)
router.delete('/delete/:id', simpleAuth, validate(deleteChatSchema), chatController.deleteChat)
router.post('/members/add', simpleAuth, validate(addMembersSchema), chatController.addMembers)
router.post(
  '/members/remove',
  simpleAuth,
  validate(removeChatMemberSchema),
  chatController.removeChatMember
)
router.post('/edit', simpleAuth, validate(editChatSchema), chatController.editChat)

module.exports = router
