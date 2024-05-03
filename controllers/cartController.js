const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Games = require('../models/gameModel')
const Cart = require('../models/cartModel')
const Swal = require('sweetalert2')


// ********** FOR RENDERING CART PAGE **********
const loadCart = async (req,res)=>{
    try {
        const user = req.session.user_id;
        const userData = await User.findOne({_id: user})
        const cartData = await Cart.find({userId:user}).populate('games.gameId')
        const totalCartPrice = cartData.reduce((acc,curr)=>acc+ curr.totalCartPrice, 0)
        // console.log('sgs'+totalCartPrice);
        res.render('cart',{user:userData,cartData:cartData,totalCartPrice:totalCartPrice})
    } catch (error) {
        console.log(error);
    }
}


// ********** FOR INSERTING GAME TO THE CART **********
const addGameToCart = async (req,res)=>{
    try {
        if(req.session.user_id){
            const userId = req.session.user_id;
            const gameId = req.query.gameId
            const game = await Games.findById(gameId)
            
            const exists = await Cart.findOne({ userId: userId });

            if (exists) {
                let isAlreadyInCart = false;
            
                exists.games.forEach(game => {
                    if (game.gameId.toString() === gameId.toString()) {
                        isAlreadyInCart = true;
                        game.quantity++;
                    }
                });
            
                if (!isAlreadyInCart) {
                    
                    let obj = {
                        gameId: gameId,
                        quantity: 1,
                        price: game.price
                    };
                    exists.games.push(obj);
                }

                exists.totalCartPrice = exists.games.reduce((total , product)=>{
                    return total + product.quantity * product.price
                },0)
            
                await exists.save();
                
                res.json({success:true})
            }else{
                const cartItem = new Cart({
                    userId : userId,
                    games : [{gameId:gameId,quantity:1,price:game.price}],
                    quantity : 1
                })
                const totalCartPrice = game.price;
                cartItem.totalCartPrice = totalCartPrice
                await cartItem.save()
                res.status(500).json({ success: false, error: 'Failed to add game to cart' });
            }
           
        }else{
            req.flash('errmsg',"Please Login for Adding Games to Cart")
            res.redirect('/allGames')         
        }

    } catch (error) {
        console.log(error);
        
    }
}


// ********** FOR REMOVING GAME FROM THE CART **********
const removeFromCart = async (req,res)=>{
    try {
        
        const gameId = req.query.gameId;
        const userId = req.session.user_id;

         
        if (await Cart.updateOne({userId},{$pull:{games:{gameId:gameId}}})) {
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false, message: "Failed to remove the game from the cart." });
        }
        
        
    } catch (error) {
        console.log(error);
    }
}


const updateCartQuantity = async (req,res)=>{
    try{
        const { quantity, itemId, cartId } = req.body;
        console.log(quantity+'q');
        console.log(itemId+'item');
        console.log(cartId + 'asfa') ;
        

    }catch(err){
        console.log(err);
    }
}



module.exports = {
    loadCart,
    addGameToCart,
    removeFromCart,
    updateCartQuantity
}