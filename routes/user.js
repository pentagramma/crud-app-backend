const express = require('express')
// const multer = require('multer');
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   },
// });

// const uploads = multer({ storage });


const router = express.Router()
const userController = require('../controller/user')
const {uniqueUser} = require('../middleware/uniqueUser')
const { loginMiddleware } = require('../middleware/loginMiddleware')
const {verifyRefreshToken, verifyAuthToken} = require('../middleware/auth');
const {upload} = require('../middleware/upload');
router.post('/signup',uniqueUser, userController.createNewUser)
router.post('/login',loginMiddleware,userController.loginUser)
router.get("/refresh",verifyRefreshToken,userController.generateNewauthToken);
router.get("/profile",verifyAuthToken,userController.getProfileDetail)
router.put('/update/:userId',verifyAuthToken,userController.updateUser)
module.exports = router