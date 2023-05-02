const UserModel = require('../model/user')

const loginMiddleware = async (req,res,next)=>{
    try{
        let {email,password} = req.query
        let user = await UserModel.find({email:email})
        if(user.length == 0){
            res.status(404).send({
                status:"failed",
                message:"Account doesn't exist with this mail id"
            })
            return
        }
        if(user[0].password !== password){
            res.status(404).send({
                status:"failed",
                message:"Incorrect Password"
            })
            return
        }
        next()
    }
    catch(e){
        res.status(400).send({
            status:"failed",
            message:'login failed',
            error: e
        })
    }
}

module.exports = {loginMiddleware}