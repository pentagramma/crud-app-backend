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

router.get('/:id',verifyAuthToken,questionController.fetchQuestionByID)
//GET route to get answers given by users
router.get('/answers/user',verifyAuthToken,questionController.retrieveAnswerByUserId)
router.post('/:questionId/like',verifyAuthToken, questionController.likeQuestion);
router.post('/:questionId/answers/:answerId/like',verifyAuthToken, questionController.likeAnswer);
router.get('/likes/:questionId',verifyAuthToken,questionController.getUsersWhoLiked)
router.get('/search/:search',questionController.fetchSearchedQuestions)
module.exports = router;