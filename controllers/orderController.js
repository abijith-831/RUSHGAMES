const Users = require('../models/userModel')
const Order = require('../models/orderModel')


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
            console.log('order',order);
            res.render('adminOrderDetails', { order });
        }
        
    }catch(error){
        console.log(error);
    }
}

 
module.exports = {
    loadOrderHistory,
    loadAdminOrderDetails
} 