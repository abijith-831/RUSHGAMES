const categoryModel = require('../models/categoryModel');
const Coupon = require('../models/couponModel')


// ********** FOR RENDERING COUPON LIST  **********
const loadCouponList = async (req,res)=>{
    try {
        const coupons = await Coupon.find()
        
        res.render('couponList',{coupons:coupons})
    } catch (error) {
        console.log(error);
        
    }
}


// ********** FOR ADDING COUPONS  **********
const addCoupon = async (req,res)=>{
    try {
        const {couponName, minimum, description, expiryDate, discount } = req.body
        const couponId = generateCouponId()
        
        const coupon = new Coupon({
            couponCode : 'RG-'+ couponId,
            couponName,
            description,
            minimum,
            discount,
            StartDate : Date.now(),
            expiry : expiryDate,
            eligible : 'usable'

        })
        await coupon.save()
        res.json({success:true})
    } catch (error) {
        console.log(error);
        
    }
}


// ********** FOR GENERATE RANDOM 8 DIGIT NUMBER FOR COUPON-ID  **********
function generateCouponId() {
    const min = 10000000; 
    const max = 99999999; 
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// ********** FOR CHANGING STATUS OF COUPONS  **********
const couponStatus = async (req,res)=>{
    try {
        const {couponId} = req.body
        const coupon = await Coupon.findOne({_id:couponId})
        
        coupon.is_active = !coupon.is_active
        await coupon.save()
        res.json({success:true , newStatus : coupon.is_active})
    } catch (error) {
        console.log(error);
        
    }
}




module.exports = {
    loadCouponList,
    addCoupon,
    couponStatus,

}