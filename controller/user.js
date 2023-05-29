const UserModel = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const RefreshToken = require("../model/RefreshToken");
const path = require("path");
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
      let token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      let refresh_token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        process.env.REFRESH_JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );
      const newRefreshToken = new RefreshToken({
        refresh_token: refresh_token,
      });
      await newRefreshToken.save();
      res.status(200).send({
        status: "success",
        token: token,
        refresh_token: refresh_token,
        user: user,
      });
    } catch (e) {
      res.status(404).send({
        message: "login failed",
        error: e,
      });
    }
  },
  getProfileDetail: async (req, res) => {
    try {
      const user = await UserModel.findById(req.user._id);
      res.status(200).send({
        user: user,
      });
    } catch (e) {
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
      const authToken = jwt.sign(
        { _id: user._id, email: user.email, firstName: user.firstName },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      return res.status(200).json({
        message: "new token generated",
        token: authToken,
      });
    } catch (e) {
      res.status(400).json({ message: err.message });
    }
  },

  updateUser: async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await UserModel.findByIdAndUpdate(userId, req.body, {
        new: true,
      });
      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  },

  updateImageUrl: async (req, res) => {
    if (!req.files) {
      return res.status(400).json({ message: "No files were uploaded." });
    }
    const imageFile = req.files.image;
    const userId = req.body.userId;

    await UserModel.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        const profilePicturePath = path.join(
          __dirname,
          "uploads",
          imageFile.name
        );
        imageFile.mv(profilePicturePath, (error) => {
          if (error) {
            console.error(error);
            return res
              .status(500)
              .json({ message: "Failed to save profile picture." });
          }

          user.imageUrl = profilePicturePath;

          return user.save();
        });
      })
      .then(() => {
        res.json({ message: "Image uploaded and saved to the user profile." });
      })
      .catch((error) => {
        console.error(error);
        res
          .status(500)
          .json({ message: "Failed to save image to the user profile." });
      });
  },
};
