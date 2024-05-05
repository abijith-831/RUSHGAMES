const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Games = require("../models/gameModel");
const Cart = require("../models/cartModel");


// ********** FOR RENDERING CART PAGE **********
const loadCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const cart = await Cart.findOne({ userId : userId}).populate({
      path: 'games.gameId',
      model: 'Games'
    }).exec();
    
    const totalCartPrice = cart.totalCartPrice;
    console.log('cartdata'+cart);

    res.render('cart',{cartData : cart.games,totalCartPrice,cartId:cart._id})
    
  } catch (error) {
    console.log(error);
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
      const exists = userCart.games.find(
        (games) => String(games.gameId) === gameId
      );
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


const updateCartQuantity = async (req, res) => {
  try {
    const { quantity, itemId, cartId } = req.body;
    // console.log(quantity+'q');
    // console.log(itemId+'item');
    // console.log(cartId + 'asfa') ;
  } catch (err) {
    console.log(err);
  }
};


module.exports = {
  loadCart,
  addGameToCart,
  removeFromCart,
  updateCartQuantity,
};
