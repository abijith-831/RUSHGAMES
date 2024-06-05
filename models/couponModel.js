const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponCode:{
        type : String,
        
    },
    couponName:{
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    minimum : {
        type : Number,
        required :true
    },
    discount : {
        type : Number,
        required : true
    },
    StartDate : {
        type : Date,
        default : ()=> Date.now()
    },
    expiry : {
        type : Date,
        required : true
    },
    is_active : {
        type : Boolean , 
        default : 0
    },
    eligible : {
        type : String
    }
})

couponSchema.index({expiry:1},{expireAfterSeconds:0})
module.exports = mongoose.model('Coupon',couponSchema)