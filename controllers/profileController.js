const User = require('../models/userModel')
const Address = require('../models/addressModel')
const Order = require('../models/orderModel')
const bcrypt = require('bcrypt')
const Games = require('../models/gameModel')
const Wallet = require('../models/walletModel')
const Coupon = require('../models/couponModel')
const Cart = require('../models/cartModel')
const PDFDocument = require('pdfkit');
const Razorpay = require('razorpay')


const instance = new Razorpay({
  key_id : 'rzp_test_v7eXLfL0Wt6Ws9',
  key_secret : 'AYLcwjPi06hnNEvNPogTv4lf'
})


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
    const count = addresses.length>0 ? addresses[0].addresses.length : 0;
    
    
    res.render('addresses',{user:userData,addresses , count})
    
  } catch (error) {
    console.log(error);
  }
}

 
// ********** FOR RENDERING EDIT ADDRESS PAGE  **********
const editAddress = async (req,res)=>{
  try {
    const user = req.session.user_id;
    const userData = await User.findOne({_id : user})
    const addressData = await Address.findOne({userId : user})
    const addressId = req.query.addressId
    const address = addressData.addresses.find(item=> item._id.toString() === addressId)
    
    res.render('editAddress',{user : userData , address})
  } catch (error) {
    console.log(error);
    
  } 
}
 

// ********** FOR SUBMITTING THE EDIT ADDRESS FORM  **********
const submitEditAddress = async (req,res)=>{
  try {
    const userId = req.session.user_id ;
    const userData = await User.findOne({_id : userId})
    const addressId = req.body.addressId;
    const addressData = await Address.findOne({userId : userId})
    const address = addressData.addresses.find(item=> item._id.toString() === addressId)
    
    address.name = req.body.name ; 
    address.mobile = req.body.mobile ; 
    address.pincode = req.body.pincode ; 
    address.district = req.body.district ; 
    address.state = req.body.state ; 
    address.city = req.body.city ; 
    address.area = req.body.area ; 
    address.houseNo = req.body.houseNo ; 

    
    await addressData.save();

    res.redirect('/addresses')
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
        if(verifyData.addresses.length >= 3){
          return res.json({ success: false, message: "You can only add up to 3 addresses." });
        }
        verifyData.addresses.push(obj);
        await verifyData.save();
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
const loadOrderHistory = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({ _id: userId });

    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    let orders = await Order.find({ userId: userId }).populate('games.gameId');
    let totalAmountSums = [];
    orders.forEach(item => {
      const totalAmountSum = item.games
        .filter(game => game.Status !== "Cancelled")
        .reduce((acc, curr) => acc + curr.totalAmount, 0);
      totalAmountSums.push(totalAmountSum);
    });

    totalAmountSums = totalAmountSums.reverse();
    orders = orders.reverse();

    const paginatedOrders = orders.slice(skip, skip + limit);
    const orderLength = orders.length;
    const totalPages = Math.ceil(orderLength / limit);

    let prevPage = page - 1;
    let nextPage = page + 1;
    if (prevPage < 1) prevPage = 1;
    if (nextPage > totalPages) nextPage = totalPages;

   
    let startPage, endPage;
    if (totalPages <= 4) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (page <= 2) {
        startPage = 1;
        endPage = 4;
      } else if (page >= totalPages - 1) {
        startPage = totalPages - 3;
        endPage = totalPages;
      } else {
        startPage = page - 1;
        endPage = page + 2;
      }
    }

    res.render('orderHistory', {
      user: userData,
      order: paginatedOrders,
      totalAmountSums,
      totalPages,
      orderLength,
      prevPage,
      nextPage,
      limit,
      page,
      startPage,
      endPage 
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
}



// ********** FOR IMPLEMENT THE RAZORPAY REPAYMENT **********
const repayment = async(req,res)=>{
  try {
      const { orderId, amount } = req.body;
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      const discountedPrice = order.discount ? order.totalCartPrice - (order.totalCartPrice * order.discount / 100): order.totalCartPrice;

      const totalCartPrice = Math.round(discountedPrice * 100); 
      const minimumAmount = 100; 
      const adjustedAmount = Math.max(totalCartPrice, minimumAmount);
      
      const razorpayOrder = await generateRazorpay(orderId, adjustedAmount);
      generateRazorpay(orderId, adjustedAmount).then(async (response) => {
       
        res.json({ success : true, Razorpay: { id: razorpayOrder.id, amount: adjustedAmount } });
      });
  } catch (error) {
      console.log(error);
  }
}
  

// ********** VERIFYING PAYMENT AS SUCCESS **********
const verifyRepayment = async(req,res)=>{
  try {
    const { paymentId, razorOrderId, signature , orderId} = req.body
    
    const order = await Order.findOne({_id:orderId})
    
    order.paymentStatus = "Success"
    await order.save()
    res.json({success:true , orderId : orderId})
  } catch (error) {
    console.log(error);
  }
}



// ********** RAZORPAY SETTINGS  **********
const generateRazorpay = (orderId, amount) => {
 
  return new Promise((resolve, reject) => {
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: "" + orderId
    };
    instance.orders.create(options, function (err, order) {
     
      if (err) {
        
        console.log(err);
        reject(err);
      }
      resolve(order);
    });
  });
};



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

 


// ********** FOR DOWNLOADING INVOICE AS PDF **********
const downloadInvoice = async (req, res) => {
  try {
    const { orderId, gameId, name } = req.body;

    const order = await Order.findOne({ _id: orderId });
   
    if (!order) {
      return res.status(404).send('Order not found');
    }

    const game = order.games.find(item => item.gameId.toString() === gameId);

    if (!game) {
      return res.status(404).send('Game not found in the order');
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice_' + orderId + '.pdf');

    doc.pipe(res);

    
    doc.fontSize(30).font('Helvetica-Bold').text('ORDER-INVOICE', { align: 'center' });
    doc.fontSize(20).font('Helvetica').text('RUSH GAMES', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Rush Games Pvt Ltd , KINFRA Techno Industrial Park,', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('National Highway 66 , near Calicut University ', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Kakkanchery Chelembra PO , Dt, Thenhipalam, Kerala 673634', { align: 'center' });

    doc.moveDown();


  
   doc.fontSize(12).font('Helvetica-Bold').text(`Order ID:`, { continued: true }).font('Helvetica').text(` ${order.orderId}`, { align: 'left' });
   doc.font('Helvetica-Bold').text(`Order Date:`, { continued: true }).font('Helvetica').text(` ${new Date(order.orderDate).toLocaleDateString('en-IN')}`, { align: 'left' });
   doc.font('Helvetica-Bold').text(`Customer Name:`, { continued: true }).font('Helvetica').text(` ${order.addresses.name}`, { align: 'left' });
   doc.font('Helvetica-Bold').text(`Delivery Address:`, { continued: true }).font('Helvetica').text(` ${order.addresses.houseNo}, ${order.addresses.area}, ${order.addresses.city}, ${order.addresses.district}, ${order.addresses.state}, ${order.addresses.pincode}`, { align: 'left' });
   doc.moveDown(2);

    

    const tableHeader = ['Game Name', 'Quantity', 'Price', 'Total Amount', 'Status'];
    const cellWidths = [150, 60, 80, 100, 100]; 
    const startX = doc.page.margins.left;
    let startY = doc.y;
    const rowHeight = 20;
    const tableHeaderBgColor = '#cccccc';
    const tableHeaderTextColor = '#000000';
    const tableCellTextColor = '#000000';


    doc.rect(startX, startY, doc.page.width - doc.page.margins.left - doc.page.margins.right, rowHeight).fill(tableHeaderBgColor);


    let currentX = startX;
    tableHeader.forEach((header, index) => {
      doc.fillColor(tableHeaderTextColor).fontSize(10).font('Helvetica-Bold').text(header, currentX, startY + 5, { width: cellWidths[index], align: 'left' });
      currentX += cellWidths[index] + 10;
    });

    let currentY = startY + rowHeight;

 
    const gameDetails = [
      name,
      game.quantity,
      game.price.toFixed(2),
      game.totalAmount.toFixed(2),
      game.Status
    ];

    currentX = startX;
    gameDetails.forEach((data, index) => {
      doc.fillColor(tableCellTextColor).fontSize(10).font('Helvetica').text(data.toString(), currentX, currentY + 5, { width: cellWidths[index], align: 'left' });
      currentX += cellWidths[index] + 10;
    });

    currentY += rowHeight;


    if (currentY > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      currentY = doc.page.margins.top;
    }

    currentY += 30;
    if (order.deliveryCharge === 'YES') {
      game.totalAmount += 80;
      const deliveryCharge = 80;
      doc.fontSize(12).font('Helvetica-Bold').text('Delivery Charge:', startX, currentY);
      doc.font('Helvetica').text(deliveryCharge.toFixed(2), startX + 200, currentY);
      currentY += rowHeight;
    }

    doc.fontSize(12).font('Helvetica-Bold').text('Total Amount:', startX, currentY);
    doc.font('Helvetica').text(game.totalAmount.toFixed(2), startX + 200, currentY);

    doc.end();
 
  } catch (error) {
    console.error('An error occurred while generating the PDF:', error);
    res.status(500).send('An error occurred while generating the PDF.');
  }
};




// ********** FOR CANCEL ORDER  **********
const cancelOrder = async (req,res)=>{
  try {
   
    const userId = req.session.user_id;
    const wallet = await Wallet.findOne({userId : userId})
    const { reason,orderId,gameId } = req.body;
    const order = await Order.findOne({_id:orderId })
    const game = order.games.find(item =>item.gameId.equals(gameId))
     
    const gameData = await Games.findOne({_id  : game.gameId})

    if(order.discount){
      game.totalAmount = game.totalAmount - ((game.totalAmount*order.discount )/ 100)
    }
    
    const nonCancelled = order.games.filter(item => item.Status !== 'Cancelled')

    // if((order.deliveryCharge == "YES" &&  order.games.length === 1)|| nonCancelled ===2){
    //   console.log('abcdd');
    //   game.totalAmount += 80
    // }

    if(order.paymentMethod !== 'cashOnDelivery'){
      if(wallet){
  
        const previousBalance = wallet.balance
        wallet.balance = wallet.balance + game.totalAmount
        wallet.history.push({
            amount : game.totalAmount,
            method : 'Order Cancelled',
            transactionType : 'credit',
            date : Date.now(),
            previousBalance,
            currBalance : wallet.balance
        })
        await wallet.save()

      }else{

        const walletData = new Wallet({
          userId:userId,
          balance : game.totalAmount,
          history : [{
            amount : game.totalAmount,
            method : 'Order Cancelled',
            transactionType:'credit',
            date : Date.now(),
            previousBalance : 0,
            currBalance : game.totalAmount
          }] 


      })
      await walletData.save();
    }
      
  }

    game.reason = reason ; 
    gameData.stock = gameData.stock + game.quantity;
    order.totalCartPrice = order.totalCartPrice - game.totalAmount
    game.Status = 'Cancelled';
    await gameData.save();
    await order.save()
    res.json({success:true})

  } catch (error) {
    console.log('error');
    
  }
} 



// ********** FOR RETURNING ORDER  **********
const returnOrder = async (req,res)=>{
  try {
    if(req.body){
      res.json({success : true})
    }
    const { gameId , orderId , reason} = req.body;
    
    const order = await Order.findById(orderId)
    if(!order){
      return res.status(404).json({success : false , message : "Order not Found"})
    }

    const game = order.games.find(item => item.gameId.toString()===gameId)
    
    if ( game ){
      game.Status = "Return";
      game.reason = reason;
    } 

    order.approval = 1 
    await order.save();
  } catch (error) {
    console.log(error);
    
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
 

//********** FOR WITHDRAWING MONEY TO WALLET **********
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


//********** FOR RENDERING COUPONS PAGE IN USER SIDE **********
const loadCoupons = async (req,res)=>{
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({_id : userId}).populate('coupons')
    
    const coupons = userData.coupons;
    
  
    res.render('coupons',{user : userData , coupons : coupons})
    
  } catch (error) {
    console.log(error);
    
  }
} 
 

// ********** CHECK COUPON IS AVAILABLE OR NOT  **********
const checkCoupon = async (req,res)=>{
  try {

      const  userId = req.session.user_id;
      const user = await User.findOne({_id:userId}).populate('coupons')
      const code  = req.body.code

      
      if(!user.coupons || user.coupons.length===0){
        return res.json({success:false , message :'no coupon'})
      }
    
      const exists = user.coupons.find(item=>item.couponCode === code)
      const cart = await Cart.findOne({userId:userId})
      
      const couponPrice = Math.floor( cart.totalCartPrice * (exists.discount /100))


      if(exists){
        res.json({success:true ,
          discountPercentage: exists.discount ,
          cart:cart  ,
          couponPrice : couponPrice })
      }else{
        res.json({success:false , message: 'Invalid or expired coupon.'})
      }
      
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'server error' });
  }
}


module.exports = {
    loadUserProfile,
    editUserProfile,
    editUserPassword,


    loadAddresses,
    editAddress,
    submitEditAddress,
    addNewAddress,
    deleteAddress,


    loadOrderHistory,
    repayment,
    verifyRepayment,
    loadOrderDetailsPage,
    downloadInvoice,
    cancelOrder,
    returnOrder,


    loadWallet,
    addMoneyToWallet,
    withdrawMoney,


    loadCoupons,
    checkCoupon,
    instance
}