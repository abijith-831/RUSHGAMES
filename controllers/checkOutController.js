const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const Games = require('../models/gameModel');
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel')
const Order = require('../models/orderModel') 



// ********** FOR RENDERING CHECKOUT PAGE **********
const loadCheckOut = async (req,res)=>{
    try {
      let userId = req.session.user_id;
      const userData = await User.findOne({_id: userId})
      const addresses = await Address.find({userId : userId})
      const cartData = await Cart.findOne({userId : userId})
      if(!cartData || cartData.games.length === 0){
        return res.json({message:"There is Nothing in Cart to Purchase"})
      }
      const gameIds = cartData.games.map(game => game.gameId);
      const gameDetailsPromises = gameIds.map(gameId => Games.findOne({_id: gameId}));
      const gameDetails = await Promise.all(gameDetailsPromises);
      
      res.render('checkOut',{user : userData , addresses , cartData , gameDetails})
    } catch (error) {
      console.log(error);
    }
}


// ********** FOR ADDING NEW ADDRESS  **********
const addNewAddress = async (req,res)=>{
  try {
    const user =req.session.user_id
    const { name , mobile, pincode ,district,state,city,area,houseNo} = req.body
    const verifyData = await Address.findOne({userId:user})
    
     let obj={
      name: name,
      mobile:  mobile,
      pincode: pincode,
      district:  district,
      state:  state,
      city:  city,
      area:  area,
      houseNo: houseNo
      }
    
      if(verifyData){
        verifyData.addresses.push(obj)
        await verifyData.save()
      }else{
        let newAddress=new Address({
          userId:user,
          addresses:[obj]
        })
        await newAddress.save()
      }


    res.json({success:true,message:"Address Added Successfully"})
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 


// ********** FOR ORDER PLACEMENT  **********
const placeOrder = async (req,res)=>{
  try {
 
    const userId = req.session.user_id;
    const selectedPayment = req.body.paymentMethod;
    const addressId = req.body.addressId;
    const abc= await Address.findOne({ 'addresses._id':addressId})
    const addressData = abc.addresses.find(address => address._id.equals(addressId))
    
    if (!addressData) {
      return res.status(400).json({ message: "Address not found." });
    }
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(400).json({ message: "Cart not found for this user." });
    }

    const orderId = generateOrderId()
  
    const newOrder = new Order ({
      userId : userId ,
      games : cart.games.map(item => ({
        gameId : item.gameId ,
        quantity :item.quantity , 
        Status : 'Confirmed',
        reason : '',
        price : item.price,
        totalAmount : item.totalAmount
      })), 
      totalCartPrice : cart.totalCartPrice,
      addresses: {
        name : addressData.name,
        mobile : addressData.mobile,
        pincode : addressData.pincode,
        district : addressData.district,
        state : addressData.state,
        city : addressData.city,
        area : addressData.area,
        houseNo : addressData.houseNo,
      },
      paymentMethod : selectedPayment,
      paymentStatus : 'Pending' , 
      orderId : orderId,
      orderDate : new Date()
    })
     
    await newOrder.save()
    await Cart.findOneAndDelete({userId : userId})
    for (const item of cart.games){
      await Games.updateOne(
        {_id:item.gameId},
        {$inc : {stock : - item.quantity}}
      )
    }
    
    res.json({success: true})
    
  } catch (error) {
    console.log(error);
  }
}

 
// ********** FOR GENERATE RANDOM 8 DIGIT NUMBER FOR ORDER-ID  **********
function generateOrderId() {
  const min = 10000000; // Minimum 8-digit number
  const max = 99999999; // Maximum 8-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    loadCheckOut,
    addNewAddress,
    placeOrder
}



