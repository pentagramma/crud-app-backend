const express = require('express');
const router = express.Router();

const questionController = require('../controller/questionController');

// POST route to create a new question
router.post('/', questionController.createQuestion);

// PATCH route to update an answer in the answer array
router.patch('/answers/:questionId', questionController.updateAnswer);

module.exports = router;