const mongoose = require('mongoose')


const gameOfferSchema = new mongoose.Schema ({
    gameId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Games",
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

gameOfferSchema.index ({ expiry :1} , { expireAfterSeconds : 0})

module.exports = mongoose.model ('gameOffer',gameOfferSchema )