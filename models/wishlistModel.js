const mongoose = require('mongoose')

const wishlistSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : true
    },
    games : [
        {
            gameId : {
                type : mongoose.Schema.Types.ObjectId,
                ref:'Games',
                required : true
            }
        }
    ]
})

module.exports = mongoose.model('Wishlist',wishlistSchema)