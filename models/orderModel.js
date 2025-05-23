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
                ref:'Games',
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
            approval :{
                type :String,
                enum : ['Accepted',"Rejected",'Waiting'],
                default : 'Waiting' 
            }   
        },
    ],
    totalCartPrice : {
        type : Number,
        required : true
    },
   
    
    addresses: {
        name: {
            type: String,
            required: true
        },
        mobile: {
            type: Number,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        area: {
            type: String,
            required: true
        },
        houseNo: {
            type: String,
            required: true
        }
    },
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
    discount : {
        type :Number
    },
    deliveryCharge : {
        type : String,
        enum:["YES","NO"],
        default : "NO"
    }
})

module.exports = mongoose.model('Order',orderSchema);