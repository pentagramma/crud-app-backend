const express = require('express')

const router = express.Router()
const chatbotController = require('../controller/chatbot')

router.get('/:question',chatbotController.getAnswer)

module.exports = router

