const User = require('../models/userModel')
const Games = require('../models/gameModel')
const Wishlist = require('../models/wishlistModel')
const Cart = require('../models/cartModel')


// ********** FOR RENDERING WISHLIST PAGE **********
const loadWishlist = async (req,res)=>{
    try {
        const userId = req.session.user_id;
        const userData = await User.findOne({_id : userId})
        const wishlistData = await Wishlist.findOne({userId:userId}).populate('games.gameId');
        res.render('wishlist',{ user : userData , wishlistData : wishlistData})
    } catch (error) {
        console.log(error);
    }
}
 

// ********** FOR ADDING GAME TO THE WISHLIST **********
const addToWishlist = async (req,res)=>{
    try {
        if(req.session.user_id){
            const userId = req.session.user_id;
            const gameId = req.query.gameId;
            const game = await Games.findById(gameId)
            
            const wishlist = await Wishlist.findOne({ userId : userId })
            if(wishlist){
                const exists = wishlist.games.find(item => item.gameId.toString()===gameId)
                if (exists){
                    return res.json({ success: false, error: 'Game already exists in the Wishlist' });
                }else{
                    wishlist.games.push({ gameId : gameId , price : game.price})
                    await wishlist.save()
                }
                
            }else{
                const newWishlist = new Wishlist({
                    userId : userId,
                    games : [{ gameId : gameId , price : game.price}]
                })
                await newWishlist.save()              
            }
            res.json({success : true})
        }else{
            console.log('error');
            res.status(500).json({ success: false, error: 'Please Login to Add Games to Wishlist' });
        }
    } catch (error) {
        console.log(error);
    }
}


// ********** FOR REMOVING GAMES FROM WISHLIST **********
const removeFromWishlist = async (req,res)=>{
    try {
        const gameId = req.query.gameId;
        const userId = req.session.user_id;
        console.log('id'+gameId);
        console.log('user'+userId)
        if(await Wishlist.updateOne({userId} , {$pull:{games:{gameId : gameId}}})){
            res.status(200).json({ success: true });
        }else{
            res.status(400).json({ success: false, message: "Failed to remove the game from the Wishlist." });
        }
            
        
    } catch (error) {
        
    }
}


// ********** FOR ADDING GAME TO THE CART AND REMOVE FROM THE WISHLIST **********
const addToCartAndRemove = async (req, res) => {
    try {
        
            const userId = req.session.user_id;
            const gameId = req.query.gameId;
            const game = await Games.findById(gameId);

            const cart = await Cart.findOne({ userId: userId });
            const wishlist = await Wishlist.findOne({ userId : userId})



            if (cart && wishlist) {
                const remove = wishlist.games.findIndex(item => item.gameId.toString()===gameId.toString())
                if(remove !== -1){
                    wishlist.games.splice(remove , 1)
                    await wishlist.save()
                }
                let gameExists = false;
                cart.games.forEach(cartGame => {
                    if (cartGame.gameId.toString() === gameId.toString()) {
                        cartGame.quantity++;
                        gameExists = true;
                    }
                });

                if (!gameExists) {
                    const newCartItem = {
                        gameId: gameId,
                        quantity: 1,
                        price: game.price
                    };
                    cart.games.push(newCartItem);
                }

                await cart.save();
                res.json({ success: true });
            } else {
                const newCart = new Cart({
                    userId: userId,
                    games: [{
                        gameId: gameId,
                        quantity: 1,
                        price: game.price
                    }]
                });

                await newCart.save();
                res.json({ success: true });
            }
        
           
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};


module.exports = {
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    addToCartAndRemove
}