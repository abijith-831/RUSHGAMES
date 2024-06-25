const User = require('../models/userModel')
const Games = require('../models/gameModel')
const Wishlist = require('../models/wishlistModel')
const Cart = require('../models/cartModel')
const Message = require('../models/messageModel')



// ********** FOR RENDERING WISHLIST PAGE **********
const loadWishlist = async (req,res)=>{
    try {
        const userId = req.session.user_id;
        
        const userData = await User.findOne({_id : userId})
        const wishlistData = await Wishlist.findOne({userId:userId}).populate('games.gameId');
        
        let count = 0;
        if (wishlistData && wishlistData.games) {
            count = wishlistData.games.length;
        }
        
        res.render('wishlist',{ user : userData , wishlistData : wishlistData , count : count})
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
                    wishlist.games.push({ gameId : gameId , price : game.finalPrice})
                    await wishlist.save()
                }
                
                
            }else{
                const newWishlist = new Wishlist({
                    userId : userId,
                    games : [{ gameId : gameId , price : game.finalPrice}]
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
        
        if(await Wishlist.updateOne({userId} , {$pull:{games:{gameId : gameId}}})){
            res.status(200).json({ success: true });
        }else{
            res.status(400).json({ success: false, message: "Failed to remove the game from the Wishlist." });
        }
            
        
    } catch (error) {
        console.log(error);
        
    }
}



// ********** FOR ADDING GAME TO THE CART AND REMOVE FROM THE WISHLIST **********
const addToCartAndRemove = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const gameId = req.query.gameId;
        const game = await Games.findById(gameId);
        
        if (!game) {
            return res.status(404).json({ success: false, error: 'Game not found' });
        }

        let cart = await Cart.findOne({ userId: userId });
        let wishlist = await Wishlist.findOne({ userId: userId });

        if (!cart) {
            
            cart = new Cart({ userId: userId, games: [] });
        }

        if (!wishlist) {
            return res.status(404).json({ success: false, error: 'Wishlist not found' });
        }

        
        let gameExists = false;
        cart.games.forEach(cartGame => {
            if (cartGame.gameId.toString() === gameId.toString()) {         
                gameExists = true;
            }
        });

        if(gameExists){
            return res.json({ success: false, message: 'Game already in cart' });    
        }
        
        if (!gameExists) {
            const newCartItem = {
                gameId: gameId,
                quantity: 1,
                price: game.finalPrice,
                totalAmount :  game.finalPrice
            };
            cart.totalCartPrice += game.finalPrice;
            cart.games.push(newCartItem);
        }
        wishlist.games = wishlist.games.filter(wishlistGame => wishlistGame.gameId.toString() !== gameId.toString());
        await wishlist.save();

        await cart.save();

        
       

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};



// ********** FOR RENDERING NOTIFICATION PAGE **********
const loadNotification = async (req, res) => {
    try {
        let userId = req.session.user_id;

        const userData = await User.findOne({ _id: userId });

        const messageData = await Message.findOne({ userId: userId }, { messages: 1 });

        let messages = null 

        if (messageData && messageData.messages.length > 0) {
            messages = messageData.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            for (const item of messages) {
                item.is_readed = true;
            }
            await messageData.save();
        }

        res.render('notification', { user: userData, messages });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};



module.exports = {
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    addToCartAndRemove,


    loadNotification
}