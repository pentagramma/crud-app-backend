const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    imageUrl:{type:String},
    companyName:{type:String},
    designation:{type:String}
})

const UserModel = mongoose.model('Users',userSchema)

module.exports = UserModel