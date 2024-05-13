const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Games = require("../models/gameModel");
const Cart = require("../models/cartModel");


// ********** FOR RENDERING CART PAGE **********
const loadCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({ _id: userId });
    const cart = await Cart.findOne({ userId: userId }).populate({
      path: 'games.gameId',
      model: 'Games'
    }).exec();
    
    if (!cart || cart.games.length === 0) {
      const totalCartPrice = 0;
      res.render('cart', { user: userData, cartData: [], totalCartPrice, cartId: null, isEmpty: true });
    } else {
      const cartData = cart.games.map(item => ({
        gameId: item.gameId,
        name: item.gameId.name,
        price: item.price,
        quantity: item.quantity,
        totalAmount: item.totalAmount,
        mainImage: item.gameId.mainImage[0]
      }));
  
      const totalCartPrice = cart.totalCartPrice;
        res.render('cart', { user: userData, cartData, totalCartPrice, cartId: cart._id, isEmpty: false });
    }
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).send('Internal Server Error');
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
        const gamePrice = quantity * game.price;
        const cart = new Cart({
          userId: userId,
          games: [
            {
              gameId: game._id,
              quantity: quantity,
              price: game.price,
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
        exists.quantity += parseInt(quantity);
        exists.totalAmount = exists.quantity * game.price;
      } else {
        const gamePrice = quantity * game.price;
        userCart.games.push({
          gameId: game._id,
          quantity: quantity,
          price: game.price,
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
    
    if (
      await Cart.updateOne({ userId }, { $pull: { games: { gameId: gameId } } })
    ) {
      res.status(200).json({ success: true });
    } else {
      res
        .status(400)
        .json({
          success: false,
          message: "Failed to remove the game from the cart.",
        });
    }
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
    const gamePrice = game.price;
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
