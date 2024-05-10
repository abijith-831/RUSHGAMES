const Users = require('../models/userModel')

const loadOrderHistory = async (req,res)=>{
    try {
        res.render('orderMgmt')
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    loadOrderHistory
}