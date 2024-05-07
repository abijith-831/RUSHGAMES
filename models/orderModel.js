const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },

    games:[
        {
            gameId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Game',
                required:true
            },
            quantity:{
                type:Number,
                required:true
            },
            Status:{
                type:String,
                enum: ['Confirmed', 'Shipped', 'Cancelled', 'Return','Delivered'],
                default:'Confirmed',
            },
            reason:{
                type:String,
            },
            price:{
                type:Number
            },
            totalAmount:{
                type:Number,
                required:true,
            },
           
        },
    ],
    totalCartPrice : {
        type : Number,
        required : true
    },
   
    
    addresses : {
        name : String,
        mobile : Number,
        pincode : Number,
        district : String,
        state : String,
        city : String,
        area : String ,
        houseNo :Number

    } ,

    paymentMethod:{
        type:String,
        required:true
    },

    paymentStatus:{
        type:String,
        enum:["Pending", "Success", "Failed"],
        default:"Pending",
    },

    orderId:{
        type: Number,
        required:true
    },

    orderDate:{
        type:Date,
        default: ()=> Date.now(),
    },

})

module.exports = mongoose.model('Order',orderSchema);