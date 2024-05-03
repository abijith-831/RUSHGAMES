const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name : {
        type :String,
        required:true
    },

    email : {
        type:String,
        required:true
    },

    mobile : {
        type:Number,
        
    },

    password : {
        type :String,
        required:true
    },

    confirmPassword : {
        type :String,
        
    },
   
    is_verified : {
        type:Boolean,
        default :false
    },
    is_blocked : {
        type : Boolean,
        required : false
    }

})


//CREATING MODEL
module.exports = mongoose.model('User',userSchema)


