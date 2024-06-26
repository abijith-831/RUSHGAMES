const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Games = require("../models/gameModel");
const Cart = require("../models/cartModel");


// ********** FOR RENDERING CART PAGE **********
const loadCart = async (req, res ,next) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({ _id: userId });
    let errmsg = req.flash ('errmsg')

    const cart = await Cart.findOne({ userId: userId }).populate({
      path: 'games.gameId',
      model: 'Games'
    }).exec();

 
     
    if (!cart || cart.games.length === 0) {
      const totalCartPrice = 0;
      res.render('cart', { user: userData, cartData: [], totalCartPrice, cartId: null, isEmpty: true , errmsg });
    } else {
      const cartData = cart.games.map(item => ({
        gameId: item.gameId,
        name: item.gameId.name,
        price: item.price,
        quantity: item.quantity,
        totalAmount: item.finalPrice,
        mainImage: item.gameId.mainImage[0]
      }));
        
        const totalCartPrice = cart.totalCartPrice;
        res.render('cart', { user: userData, cartData, totalCartPrice, cartId: cart._id, isEmpty: false ,errmsg });
    }
  } catch (error) {
    console.error('Error in loadCart:', error);
    error.statusCode = 500;
    next(error)
  } 
};

 
 
// ********** FOR INSERTING GAME TO THE CART **********
const addGameToCart = async (req, res) => {
  try {
    
    if (req.session.user_id) {
      const gameId = req.query.gameId.trim();
      const quantity = req.query.quantity;
      const userId = req.session.user_id;
      let userCart = await Cart.findOne({ userId: userId });
      const game = await Games.findById(gameId);
      
 
      if (!userCart) {
        const gamePrice = quantity * game.finalPrice;
        const cart = new Cart({
          userId: userId,
          games: [
            {
              gameId: game._id,
              quantity: quantity,
              price: game.finalPrice,
              totalAmount: gamePrice,
            },
          ],
          totalCartPrice: gamePrice,
        });
        cart.totalCartPrice = cart.games.reduce(
          (acc, curr) => (acc = curr.totalAmount),
          0
        );
       
        await cart.save();
        res.json({ success: true });
      }
      const exists = userCart.games.find((games) => String(games.gameId) === gameId);

      if (exists) {
        if(exists.quantity >= game.stock){
          return res.json({success : false , message : 'stockout'})
        }
       
        exists.quantity += parseInt(quantity);
        exists.totalAmount = exists.quantity * game.finalPrice;

      } else {
        const gamePrice = quantity * game.finalPrice;
        userCart.games.push({
          gameId: game._id,
          quantity: quantity,
          price: game.finalPrice,
          totalAmount: gamePrice,
        });
      }
      userCart.totalCartPrice = userCart.games.reduce(
        (acc, curr) => acc + curr.totalAmount,
        0
      );
      await userCart.save();
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};



// ********** FOR REMOVING GAME FROM THE CART **********
const removeFromCart = async (req, res) => {
  try {
    const gameId = req.query.gameId;
    const userId = req.session.user_id;
    
    const updateResult = await Cart.updateOne(
      { userId },
      { $pull: { games: { gameId: gameId } } }
     );

     const cart = await Cart.findOne({ userId })
        console.log('csdfdsf'+cart);
      if(updateResult){
        let totalCartPrice = 0
        
        if(cart){
          cart.games.forEach(item =>{
            totalCartPrice += item.totalAmount
          })

          cart.totalCartPrice = totalCartPrice
          await cart.save()
        }
      }
      res.json({ success: true });

  } catch (error) {
    console.log(error);
    
  }
};



// ********** FOR UPDATING PRICES ACCORDING TO QUANTITY **********
const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { quantity, gameId, cartId } = req.body;
    
    const game = await Games.findById(gameId)
    const gamePrice = game.finalPrice;
    const exists = await Cart.findById(cartId)
    

    if(!exists){
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const gameUpdate = exists.games.find(item=>item.gameId.equals(gameId))
    if (!gameUpdate) {
      return res.status(404).json({ success: false, message: "Product not found in the cart" });
    }
    
    gameUpdate.quantity = quantity;
    gameUpdate.totalAmount = quantity * gamePrice;

    exists.totalCartPrice = exists.games.reduce((acc , curr)=>{
      return acc + curr.totalAmount
    },0)
    

    const cartUpdated = await exists.save()
    res.json({
      succes:true,
      updatedTotalAmount:gameUpdate.totalAmount,
      updatedTotalCartPrice:exists.totalCartPrice
    });
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



module.exports = {
  loadCart,
  addGameToCart,
  removeFromCart,
  updateCartQuantity,
};
