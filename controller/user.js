const UserModel = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const RefreshToken = require("../model/RefreshToken");

module.exports = {
  createNewUser: async (req, res) => {
    try {
      req.body.password = await bcrypt.hash(req.body.password, 10);
      let newUser = new UserModel(req.body);
      await newUser.save();
      res.status(201).send({
        status: "success",
        message: "Signup Successful",
      });
    } catch (e) {
      res.status(404).send({
        error: e,
      });
    }
  },
  loginUser: async (req, res) => {
    try {
      let user = req.user;
      let token = jwt.sign({_id:user._id,email:user.email,firstName:user.firstName,lastName:user.lastName}, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      let refresh_token = jwt.sign({_id:user._id,email:user.email,firstName:user.firstName,lastName:user.lastName}, process.env.REFRESH_JWT_SECRET, {
        expiresIn: "30d",
      });
      const newRefreshToken = new RefreshToken({
        refresh_token:refresh_token
      });
      await newRefreshToken.save();
      res.status(200).send({
        status: "success",
        token: token,
        refresh_token: refresh_token,
      });
    } catch (e) {
      res.status(404).send({
        message: "login failed",
        error: e,
      });
    }
  },
  getProfileDetail:async (req,res) =>{
    try{
      res.status(200).send({
        user:req.user
      })
    }
    catch(e){
      res.status(400).json({ message: err.message });
    }
  },
  generateNewauthToken: async (req, res) => {
    try {
      const refreshToken = await RefreshToken.find({
        refresh_token: req.header("refresh-token"),
      });
      if (!refreshToken) {
        return res.status(400).json({ message: "Need to login again" });
      }
      const user = req.user;
      const authToken = jwt.sign({_id:user._id,email:user.email,firstName:user.firstName}, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.status(200).json({
        message: "new token generated",
        token: authToken,
      });
    } catch (e) {
      res.status(400).json({ message: err.message });
    }
  },
};
