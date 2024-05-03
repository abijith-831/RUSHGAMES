const mongoose = require('mongoose')

const addressSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    addresses : [{
        name : {
            type : String,
            required : true
        },
        mobile : {
            type : Number,
            required :true
        },
        pincode : {
            type : Number,
            required : true
        },
        district : {
            type : String,
            required : true
        },
        state : {
            type : String,
            required : true
        },
        city : {
            type : String,
            required : true
        },
        area : {
            type : String,
            required : true
        },
        houseNo : {
            type : String,
            required : true
        }
    }] 
    
    
})

module.exports =  mongoose.model('Address',addressSchema)