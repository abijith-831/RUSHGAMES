const mongoose = require('mongoose');


const messageSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [
        {
            head : {
                type : String ,
                required : true
            },
            text: {
                type: String,
                required: true
            },
            createdAt : {
                type : Date , 
                default : ()=> Date.now()
            },
            is_readed: {
                type: Boolean,
                default: false
            }
        }
    ]
});

module.exports = mongoose.model('Message', messageSchema);
