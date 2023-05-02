const UserModel = require('../model/user')

const uniqueUser = async (req,res,next)=>{
    try{
        let {email} = req.body
        console.log(email)
        let user = await UserModel.find({email:email})
        console.log(user)
        if(user.length > 0){
            res.status(404).send({
                status:"failed",
                message:"Account already exists with this mail"
            })
        }
        else{
            next()
        }
    }
    catch(e){
        res.status(400).send({
            status:"failed",
            message:'Registration failed',
            error: e
        })
    }
}

module.exports = {uniqueUser}