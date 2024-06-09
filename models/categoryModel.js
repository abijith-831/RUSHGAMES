const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    name :{
        type : String,
        required : true
    },
    is_listed : {
        type : Boolean,
        default : true
    },
    categorySalesCount : {
        type : Number
    }
    
})


module.exports = mongoose.model('Category',categorySchema)