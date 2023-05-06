const router = require('express').Router();

router.use('/user', require('./user'));
router.use('/chatbot', require('./chatbot'));
router.use('/questions',require('./questions'))
module.exports = router;