const express = require('express')


const router = express.Router()
const userController = require('../controller/user')
const {uniqueUser} = require('../middleware/uniqueUser')
const { loginMiddleware } = require('../middleware/loginMiddleware')
const {verifyRefreshToken} = require('../middleware/auth');

router.post('/signup',uniqueUser, userController.createNewUser)
router.post('/login',loginMiddleware,userController.loginUser)
router.get("/refresh",verifyRefreshToken,userController.generateNewauthToken);

module.exports = router