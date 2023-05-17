const express = require('express');
const router = express.Router();

const questionController = require('../controller/questionController');
const { verifyAuthToken } = require('../middleware/auth');

// POST route to create a new question
router.post('/',verifyAuthToken, questionController.createQuestion);
//GET list of questions posted by user
router.get('/user', verifyAuthToken,questionController.retrieveQuestion);
// PATCH route to update an answer in the answer array
router.patch('/answers/:questionId', questionController.updateAnswer);

router.get('/',verifyAuthToken,questionController.fetchQuestions);

module.exports = router;