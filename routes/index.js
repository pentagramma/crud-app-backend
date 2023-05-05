const router = require('express').Router();

router.use('/user', require('./user'));
router.use('/chatbot', require('./chatbot'));

module.exports = router;