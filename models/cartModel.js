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
            ref:'Games',
            required : true
        },
        quantity : {
            type : Number,
            default :1
        },
        price : {
            type : Number,
            required : true
        }
    }],
    totalCartPrice : {
        type : Number,
        required : true
    }
   
})

module.exports = mongoose.model('Cart',cartSchema)