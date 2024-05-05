const mongoose = require('mongoose')
const Category = require('./categoryModel')

const gameSchema = mongoose.Schema({
    name : {
        type:String,
        required:true
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        required : true
    },
    price : {
        type : Number,
        required : true,
        min :0
    },
    stock : {
        type : Number,
        required : true,
        min:1
    },
    systemReq : {
        type : String,
        required : true
    },
    mainImage : {
        type : [{
            filename : String,
            path : String
        }],
        required : true
    },
    screenshotImages : {
        type : [{
            filename : String,
            path : String
        }],
        validate : [arrayLimit,'{PATH} exceeds the limit of 4'],
        required : true
    },
    is_listed : {
        type : Boolean,
        default : true
    }
    
})

function arrayLimit (val){
    return val.length <=4
}

module.exports = mongoose.model('Games', gameSchema);