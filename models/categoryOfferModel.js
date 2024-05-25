const mongoose = require('mongoose')
const Category = require('./categoryModel')


const categoryOfferSchema = new mongoose.Schema ({
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Category",
        required : true
    },
    discount : {
        type : Number , 
        required : true
    },
    startDate : {
        type : Date ,
        default : ()=> Date.now()
    },
    expiryDate : {
        type : Date , 
        required : true
    },
    is_active : {
        type : Boolean , 
        default : 0
    }
})

categoryOfferSchema.index ({ expiry :1} , { expireAfterSeconds : 0})

module.exports = mongoose.model ('categoryOffer',categoryOfferSchema )