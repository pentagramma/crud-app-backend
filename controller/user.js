const UserModel = require('../model/user')

module.exports = {
    createNewUser: async (req,res)=>{
        try{
            let newUser = new UserModel(req.body)
            await newUser.save()
            res.status(201).send({
                status:"success",
                message: "Signup Successful"
            })
        }
        catch(e){
            res.status(404).send({
                error:e
            })
        }
    },
    loginUser: async (req,res)=>{
        try{
            let {email,password} = req.query
            let user = await UserModel.find({email:email})
            if(user[0].password == password){
                res.status(200).send({
                    status:"success",
                    userData: user[0]
                })
            }
        }
        catch(e){
            res.status(404).send({
                error:e
            })
        }
    }
}