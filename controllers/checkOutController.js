const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const Games = require('../models/gameModel');
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel')
const Order = require('../models/orderModel') 
const Razorpay = require('razorpay')
const Wallet = require('../models/walletModel')
const Coupon = require('../models/couponModel')



const instance = new Razorpay({
  key_id : 'rzp_test_v7eXLfL0Wt6Ws9',
  key_secret : 'AYLcwjPi06hnNEvNPogTv4lf'
})
 

// ********** FOR RENDERING CHECKOUT PAGE **********
const loadCheckOut = async (req,res)=>{
  
    try {
      let userId = req.session.user_id;
      let errmsg = req.flash('errmsg')
      const userData = await User.findOne({_id: userId})
      const addresses = await Address.find({userId : userId})
      const count = addresses.length > 0 ? addresses[0].addresses.length  : 0 ;

      const cartData = await Cart.findOne({userId : userId})
      if (!cartData || cartData.games.length === 0) {
        
        req.flash('errmsg', 'Your cart is empty. Please add items to proceed to checkout.');
        return res.redirect('/cart');
    }
      
      const coupon = await Coupon.find({is_active:false})
       
      const gameIds = cartData.games.map(game => game.gameId);
      const gameDetailsPromises = gameIds.map(gameId => Games.findOne({_id: gameId}));
      const gameDetails = await Promise.all(gameDetailsPromises); 

      let deliveryCharge = 0
      if(cartData.totalCartPrice < 2500){
        cartData.deliveryCharge = 80
        await cartData.save();
      }else{
        cartData.deliveryCharge = 0
        await cartData.save();
      }
      
      res.render('checkOut',{user : userData , addresses , cartData , gameDetails,errmsg ,coupon , count})
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
const placeOrder = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const selectedPayment = req.body.paymentMethod;
    const couponId = req.body.couponId;
    const addressId = req.body.addressId;

    const userData = await User.findOne({ _id: userId }).populate('coupons');
    const coupon = userData.coupons.find(item => item.couponCode === couponId);
    const addressData = await Address.findOne({ 'addresses._id': addressId }, { 'addresses.$': 1 });

    if (!addressData) {
      return res.status(400).json({ message: "Address not found." });
    }
    
    const cart = await Cart.findOne({ userId: userId });

    if(coupon){
      cart.totalCartPrice = cart.totalCartPrice - (cart.totalCartPrice * coupon.discount / 100)

      await cart.save()
    }


    if(cart.deliveryCharge){
      cart.totalCartPrice += cart.deliveryCharge;
 
      await cart.save();
      
      
    }
    
    


    const orderId = generateOrderId();

    const newOrderData = {
      userId: userId,
      games: cart.games.map(item => ({
        gameId: item.gameId,
        quantity: item.quantity,
        Status: 'Confirmed',
        reason: '',
        price: item.price,
        totalAmount: item.totalAmount
      })),
      totalCartPrice: cart.totalCartPrice ,
      addresses: {
        name: addressData.addresses[0].name,
        mobile: addressData.addresses[0].mobile,
        pincode: addressData.addresses[0].pincode,
        district: addressData.addresses[0].district,
        state: addressData.addresses[0].state,
        city: addressData.addresses[0].city,
        area: addressData.addresses[0].area,
        houseNo: addressData.addresses[0].houseNo,
      },
      paymentMethod: selectedPayment,
      paymentStatus: 'Failed',
      orderId: orderId,
      orderDate: new Date(),
      deliveryCharge : "NO"
    };
    
    if (coupon) {
      newOrderData.discount = coupon.discount;
    }

    const orderInstance = new Order(newOrderData);

    if(orderInstance.totalCartPrice < 2500){
      orderInstance.deliveryCharge = "YES"
    }
   
    
    let discountedPrice = cart.totalCartPrice;

    if (selectedPayment === 'wallet') {
      const wallet = await Wallet.findOne({ userId: userId });
      if (!wallet) {
        return res.json({ success: false, message: "nowallet" });
      } else if (cart.totalCartPrice > wallet.balance) {
        return res.json({ success: false, message: "Insufficient" });
      } else {
        
        wallet.balance -= cart.totalCartPrice;

        wallet.history.push({
          amount: discountedPrice,
          method: 'Purchase',
          transactionType: 'debit',
          date: Date.now(),
          currBalance: wallet.balance
        });


        orderInstance.paymentStatus = 'Success'
        

        await wallet.save();
        await orderInstance.save();
        
        await Cart.findOneAndDelete({ userId: userId });
        await giveCoupon(userId, cart.totalCartPrice);

        res.json({ success: true , orderId : orderInstance._id});
       
      }
    } else if (selectedPayment === 'onlinePayment') {
      
      const totalCartPrice = Math.round(discountedPrice * 100);
      const minimumAmount = 100;
      const adjustedAmount = Math.max(totalCartPrice, minimumAmount);

         
      await orderInstance.save();
      await Cart.findOneAndDelete({ userId: userId });
      await giveCoupon(userId, cart.totalCartPrice);
          
      generateRazorpay(orderInstance._id, adjustedAmount).then(async (response) => {
       
        res.json({ Razorpay: response });
      });
    } else if (selectedPayment === 'cashOnDelivery') {
      if(cart.totalCartPrice < 1000){
          return res.json({success:false,message:'nocod'})
      }
      orderInstance.paymentStatus = 'Pending';
      await orderInstance.save();
      await Cart.findOneAndDelete({ userId: userId });
      await giveCoupon(userId, cart.totalCartPrice);

      
      res.json({ success: true , orderId : orderInstance._id});
    }


    //decreasing the stock and increasing the gamesalescount.....
    for (const item of cart.games){

      const game = await Games.findById(item.gameId);
      await Games.updateOne(
        {_id:item.gameId},
        { $inc : { stock : - item.quantity , gameSalesCount : +item.quantity}}
      )

      await Category.updateOne(
        { _id : game.category},
        { $inc : { categorySalesCount : + item.quantity}}
      )
    } 
 

    if (coupon) {
      await User.updateOne(
        { _id: userId },
        { $pull: { coupons: coupon._id } }
      );
  } 

 
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred during order placement." });
  }
};

   

// ********** RAZORPAY SETTINGS  **********
const generateRazorpay = (orderId , totalCartPrice)=>{
  return new Promise((resolve , reject)=>{

    const options = {
      amount : totalCartPrice,
      currency : 'INR',
      receipt : ""+orderId
    };
    instance.orders.create(options,function(err,order){
      if(err){
        console.log(err);
      }
      resolve(order)
    })
  })
}
  



// ********** GIVE COUPONS FUCNTION **********
const giveCoupon = async (userId , totalCartPrice)=>{
  try {
    
    const user = await User.findById(userId);
    if(user.coupons && user.coupons.length>0){
      return;
    }
    
    const coupons = await Coupon.find({is_active : false})
  
    for(const item of coupons){
      if(totalCartPrice >= item.minimum){
        await User.findByIdAndUpdate({_id:userId},{$push:{coupons : item._id}});
      }
    }
  } catch (error) {
    console.log(error);
    
  } 
}


// ********** VERIFYING PAYMENT AS SUCCESS **********
const verifyPayment = async (req,res)=>{
  try {
    
    const userId = req.session.user_id;
    const { payment, order ,addressId} = req.body;
    
    
    const orders = await Order.find({userId:userId}).sort({orderDate : -1}).limit(1)   
    const lastOrder = orders[0]
    const orderId = lastOrder._id
    
    lastOrder.paymentStatus = "Success"
    await lastOrder.save()
    res.json({success:true , orderId : orderId})
    
  } catch (error) {
    console.log(error);
  }
}
 


const LoadSuccessPage = async (req,res)=>{
  try {
    let userId = req.session.user_id;
    let userData = await User.findOne({_id:userId})

    const orderId = req.query.orderId
    const order = await Order.findOne({_id : orderId})
    console.log('njkjh'+order);
    res.render('success',{ user : userData, order })
  } catch (error) {
    console.log(error);
  }
}


// ********** FOR GENERATE RANDOM 8 DIGIT NUMBER FOR ORDER-ID  **********
function generateOrderId() {
  const min = 10000000; 
  const max = 99999999; 
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



module.exports = {
    loadCheckOut,
    addNewAddress,
    placeOrder,
    verifyPayment,
    LoadSuccessPage,
    instance
}



