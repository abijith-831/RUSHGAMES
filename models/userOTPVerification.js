const mongoose = require("mongoose")

const userOTPVerificationSchema = new mongoose.Schema({
    email :{
        type:String,
        required :true
    },
    otp :{
        type:String,
        required:true
    },
    createtAt :{
        type: Date,
        default : Date.now,
        expires : 60
    }
})

const UserOTPVerification = mongoose.model('UserOTPVerification',userOTPVerificationSchema)
module.exports = UserOTPVerification
