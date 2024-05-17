const mongoose = require('mongoose');


const walletSchema =new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    balance:{
        type:Number
    },

    history:[{
        amount:{
            type:Number
        },
        method : {
            type : String
        },
        transactionType:{
            type:String
        },
        date:{
            type:Date,
            default:Date.now
        },
        previousBalance:{
            type:Number
        }
    }]
})


module.exports = mongoose.model('Wallet',walletSchema)