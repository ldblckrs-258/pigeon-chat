const express = require('express')
const userController = require('../controllers/user.controller')
const { validate } = require('../middlewares/validation.middleware')
const { getUserSchema, findUserByEmailSchema, getUsersSchema } = require('../schemas/user.schema')

const router = express.Router()

router.get('/get', validate(getUserSchema), userController.getUser)
router.get('/all', validate(getUsersSchema), userController.getUsers)
router.get('/find', validate(findUserByEmailSchema), userController.findUserByEmail)

module.exports = router
