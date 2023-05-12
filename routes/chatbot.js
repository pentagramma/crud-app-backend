const express = require('express')

const router = express.Router()
const chatbotController = require('../controller/chatbot')
const {verifyAuthToken} = require('../middleware/auth')

router.get('/:question',verifyAuthToken, chatbotController.getAnswer)

module.exports = router

