const Users = require('../models/userModel')
const Order = require('../models/orderModel')
const Games = require('../models/gameModel')
const Wallet = require('../models/walletModel')


// ********** FOR RENDERING ORDER MANAGEMENNT PAGE **********
const loadOrderHistory = async (req,res)=>{
    try {
        const orders = await Order.find().populate('userId')
       
        res.render('orderMgmt',{orders})
    } catch (error) {
        console.log(error);
        
    }
} 


// ********** FOR RENDERING ORDER DETAILS PAGE **********   
const loadAdminOrderDetails = async (req,res)=>{
    try{
        const orderId = req.query.orderId;
        const orders = await Order.find({_id:orderId}).populate('userId').populate('games.gameId')
        
        if (orders.length === 1) {
            const order = orders[0];
            res.render('adminOrderDetails', { order });
        }
        
    }catch(error){
        console.log(error);
        
    }
}


// ********** FOR CHANGING THE STATUS IN ADMIN SIDE ********** 
const changeStatus = async (req,res)=>{
    try {
        
    const {status , orderId , gameId} = req.body
    const order = await Order.findById(orderId);
    if(!order){
        return res.status(404).json({message: 'Order not found'})
    }
    const game = order.games.find(item=>item.gameId.toString()===gameId)
    game.Status = status;
    await order.save()
   
    }catch(error){
        console.log(error);
        
    }
}
 

// ********** FOR APPROVING THE RETURN REQUEST  ********** 
const approveRequest = async (req,res)=>{
    try {
        const userId = req.session.user_id;
        
        const { orderId , gameId } = req.body;
        const order = await Order.findById(orderId)
        const gameData = await Games.findOne({_id : gameId})
        const wallet = await Wallet.findOne({userId : userId})
        

        const game = order.games.find(game => game.gameId.toString()===gameId);

        if(game){
            if(order.paymentMethod !== 'cashOnDelivery'){
                const previousBalance = wallet.balance
                wallet.balance = wallet.balance + game.price
                wallet.history.push({
                    amount : game.price,
                    method : 'Purchase Return',
                    transactionType : 'credit',
                    date : Date.now(),
                    previousBalance,
                    currBalance : wallet.balance
                })
                await wallet.save()
            }
            game.approval = "Accepted";
            order.totalCartPrice = order.totalCartPrice - game.totalAmount;
            if(game.reason !== 'Defective or Damaged Game'){
                gameData.stock = gameData.stock + game.quantity;
                await gameData.save()
            }
            
            await order.save()
        }
        res.json({success : true})
    } catch (error) {
        console.log(error);
        
    }  
}

 
 
// ********** FOR REJECTING THE RETURN REQUEST  ********** 
const rejectRequest = async(req,res)=>{
    try {
        const { orderId , gameId} = req.body;
        const order = await Order.findById(orderId)

        const game = order.games.find(game=>game.gameId.toString()===gameId);

        if(game){
            game.approval = "Rejected";
            await order.save();
        }
        res.json ({success : true})
    } catch (error) {
        console.log(error);
        
    }
}
 

module.exports = {
    loadOrderHistory,
    loadAdminOrderDetails,
    changeStatus,

    approveRequest,
    rejectRequest
} 