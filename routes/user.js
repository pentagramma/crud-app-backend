const express = require('express')


const router = express.Router()
const userController = require('../controller/user')
const {uniqueUser} = require('../middleware/uniqueUser')
const { loginMiddleware } = require('../middleware/loginMiddleware')

router.post('/signup',uniqueUser, userController.createNewUser)
router.get('/login',loginMiddleware,userController.loginUser)

module.exports = router