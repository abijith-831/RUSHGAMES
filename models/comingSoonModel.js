const mongoose = require('mongoose')
const Category = require('./categoryModel')

const comingSoonSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        required :true
    },
    systemReq : {
        type : String
        
    },
    image : {
        type : [{
            filename : String,
            path : String
        }],
        required : true
    },
    expectedArrival : {
        type : String,
        required:true
    }
})

module.exports = mongoose.model('comingSoon',comingSoonSchema)