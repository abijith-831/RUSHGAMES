const mongoose = require('mongoose')


const cartSchema = new mongoose.Schema ({
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required:true
    },
    games : [{
        gameId : {
            type : mongoose.Schema.Types.ObjectId,
            ref:'Game',
            required : true
        },
        quantity : {
            type : Number,
            default :1
        },
        price : {
            type : Number,
            required : true
        },
        totalAmount : {
            type : Number,
            required : true
        }
    }],
    deliveryCharge : {
        type : Number,    
    },
    totalCartPrice : {
        type : Number,
        
    }
   
})

module.exports = mongoose.model('Cart',cartSchema)