const jwt = require('jsonwebtoken')

const verifyAuthToken = async (req,res,next)=>{
    try{
        const token = req.header('token');
        const verified = jwt.verify(token,process.env.JWT_SECRET);
        console.log(verified)
        req.user = verified;
        next();
    }catch(err){
      return res.status(400).json({
        message:err.message
      })
    }
   
}

const verifyRefreshToken = (req, res, next) => {
    try {
      const token = req.header("refresh-token");
      const verified = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
      req.user = verified;
      next();
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  module.exports.verifyAuthToken = verifyAuthToken;
  module.exports.verifyRefreshToken = verifyRefreshToken;