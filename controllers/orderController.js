const Users = require('../models/userModel')
const Order = require('../models/orderModel')
const Games = require('../models/gameModel')


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
 

module.exports = {
    loadOrderHistory,
    loadAdminOrderDetails,
    changeStatus
} 