const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const Games = require('../models/gameModel');
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel')


// ********** FOR RENDERING CHECKOUT PAGE **********
const loadCheckOut = async (req,res)=>{
    try {
      let user = req.session.user_id;
      const userData = await User.findOne({ _id : user})
      const addresses = await Address.find({userId : user})
      const cartData = await Cart.findOne({userId:user}).populate('games.gameId')
      console.log('sgedg'+cartData);
      res.render('checkOut',{user : userData , addresses , cartData})
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


const placeOrder = async (req,res)=>{
  try {
    console.log('oreder');
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
    loadCheckOut,
    addNewAddress,
    placeOrder
}
