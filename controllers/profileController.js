const User = require('../models/userModel')
const Address = require('../models/addressModel')
const Order = require('../models/orderModel')
const bcrypt = require('bcrypt')
const Games = require('../models/gameModel')
const Wallet = require('../models/walletModel')

// ********** FOR LOADING USER PROFILE PAGE  **********
const loadUserProfile = async (req,res)=>{
    try {
      let user = req.session.user_id;
      const userData = await User.findOne({_id:user})
      if(userData.is_blocked){
        req.session.user_id = null;
        res.redirect('/login')
      }else{
        res.render('userProfile',{user:userData})
      }
      
    } catch (error) {
      console.log(error);
    }
}


// ********** FOR EDITING USER PROFILE  **********
const editUserProfile = async (req,res)=>{
  try {
    const {userId , newName , newMobile} = req.body;
    // console.log(req.body);
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({error:"User not Found"})
    }else{
    
    user.name = newName;
    user.mobile = newMobile;
    await user.save();
    res.json({success:true,message:"User Profile Updated Successfully"})
    }
    
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"Internal server Error"})
  }
}


// ********** FOR EDITING USER PASSWORD  **********
const editUserPassword = async (req,res)=>{
  try {
    const  { oldPassword , newPassword } = req.body
    const userId = req.session.user_id;

    const user = await User.findById(userId)
    
    if(!user){
      return res.status(404).json({error : "User Not Found"})
    }
    if(oldPassword===newPassword){
      return res.status(404).json({error:"Old Password and New Password Cannot be Same"})
    }
    const hashedPassword = await bcrypt.hash(newPassword,10)
    
    user.password = hashedPassword;
    user.confirmPassword = hashedPassword;
    await user.save()
    res.json({success:true , message:"Password Updated Successfully"})
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"Internal Server Error"})
  }
}
 

// ********** FOR RENDERING ADDRESS PAGE  **********
const loadAddresses = async (req,res)=>{
  try { 
    let user = req.session.user_id;
    const userData = await User.findOne({_id:user})
    const addresses = await Address.find({userId : user})
    
    
    res.render('addresses',{user:userData,addresses})
    
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


// ********** FOR DELETING  ADDRESS  **********
const deleteAddress = async (req,res)=>{
  try {
    const user = req.session.user_id;
    const { addressId } = req.body;
    const result = await Address.findOneAndUpdate({userId : user} , {$pull:{addresses:{_id:addressId}}})
    
    if(result){
      return res.status(200).json({success : true, message : "Address Deleted Successfully"})
    }else{
      return res.status(404).json({ success: false, message: "Address not found or already deleted" });
    }
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({success : false,message : "Internal server Error"})
  }
}


// ********** FOR RENDERING ORDER HISTORY PAGE **********
const loadOrderHistory = async (req,res)=>{
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({_id:userId})
    
    let orders = await Order.find({userId : userId}).populate('games.gameId');
    let totalAmountSums = [];
    orders.forEach(item=>{
      const totalAmountSum   = item.games
        .filter(game => game.Status !== "Cancelled")
        .reduce((acc,curr)=>acc+curr.totalAmount,0)
        totalAmountSums.push(totalAmountSum)
    })
    totalAmountSums = totalAmountSums.reverse()
    orders = orders.reverse()
    res.render('orderHistory',{user:userData , order:orders , totalAmountSums}) 
  } catch (error) {
    console.log(error);
  }
}

 
// ********** FOR RENDERING ORDER DETAILS PAGE **********
const loadOrderDetailsPage = async (req,res)=>{
  try {

    const userId = req.session.user_id;
    const {orderId} = req.query;
    const userData = await User.findOne({_id:userId})
    const order = await Order.findOne({orderId:orderId}).populate('games.gameId')
    let total = 0
    if (order) {
      total = order.games
        .filter(game => game.Status !== "Cancelled")
        .reduce((acc, curr) => acc + curr.totalAmount, 0);
    }
    
   
    res.render('orderDetailsPage',{user:userData , order : order , total})
    
    
  } catch (error) {
    console.log(error);
  }
}


// ********** FOR CANCEL ORDER  **********
const cancelOrder = async (req,res)=>{
  try {
    const userId = req.session.user_id;
    const {reason,orderId,gameId} = req.body;
    const order = await Order.findOne({_id:orderId })
    const game = order.games.find(item =>item.gameId.equals(gameId))
    game.reason = reason ; 
    game.Status = 'Cancelled';
    await order.save()
    res.json({success:true})
  } catch (error) {
    console.log('error');
  }
}


// ********** FOR RENDERING WALLET  **********
const loadWallet = async (req,res)=>{
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({_id:userId})
    const wallet = await Wallet.findOne({userId:userId}) 
    let rev = []
    if (wallet){
      rev =  [...wallet.history].reverse()
    }
    res.render('wallet',{user:userData , wallet , rev})
        
  } catch (error) {
    console.log(error);
  }
}


//********** FOR ADDING MONEY TO WALLET **********
const addMoneyToWallet = async (req , res)=>{
  try {

    const userId = req.session.user_id
    const {amount,method} = req.body;
    const amountNum = Number(amount)
    const wallet = await Wallet.findOne({userId : userId})
    
    if(wallet){
      
      const previousBalance = wallet.balance
      wallet.balance += amountNum
      wallet.history.push({
        amount : amountNum,
        method,
        transactionType : 'credit',
        date : Date.now(),
        previousBalance,
        currBalance : wallet.balance
      })

      await wallet.save()
      res.json({success:true})
    }else{
      const walletData = new Wallet({
        userId:userId,
        balance : amountNum,
        history : [{
          amount : amountNum,
          method,
          transactionType:'credit',
          date : Date.now(),
          previousBalance : 0,
          currBalance : amountNum
        }]

      })

      await walletData.save()
      
      res.json({success : true})
    }
    
  } catch (error) {
    console.log(error);
  }
}




const withdrawMoney = async (req,res)=>{
  try {
    const userId = req.session.user_id
    const {amount}= req.body;
    const amountNum = Number(amount)
    const wallet = await Wallet.findOne({userId : userId})
    if(wallet.balance<amountNum){
      
      res.json({success:false , message : "Insufficient"})
    }else{
    
      const previousBalance = wallet.balance;
      wallet.balance = wallet.balance-amountNum;
      
      wallet.history.push({
      amount : amountNum,
      method : 'Tranferred to Bank',
      transactionType : 'debit',
      date : Date.now(),
      previousBalance,
      currBalance : wallet.balance
    })
    await wallet.save()
    res.json({success : true})
    }
    
    
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
    loadUserProfile,
    editUserProfile,
    editUserPassword,


    loadAddresses,
    addNewAddress,
    deleteAddress,


    loadOrderHistory,
    loadOrderDetailsPage,
    cancelOrder ,


    loadWallet,
    addMoneyToWallet,
    withdrawMoney
}