const UserModel = require('../model/user')
const bcrypt = require('bcrypt')

const loginMiddleware = async (req,res,next)=>{
    try{
        let {email,password} = req.body
        let user = await UserModel.find({email:email})
        if(user.length == 0){
            res.status(404).send({
                status:"failed",
                message:"Account doesn't exist with this mail id"
            })
            return
        }
        let checkPassword = await bcrypt.compare(password,user[0].password)
        if(!checkPassword){
            res.status(404).send({
                status:"failed",
                message:"Incorrect Password"
            })
            return
        }
        req.user = user[0]
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