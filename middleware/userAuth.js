const Users = require('../models/userModel')


const isLogin = async (req,res,next)=>{
    try {
        const status = await Users.findOne({_id:req.session.user_id})
        if(req.session.user_id && status.is_blocked === false){
            next()
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
    }
}


const isLogout = async (req,res,next)=>{
    try {
        if(!req.session.user_id ){
            next();
        }else{ 
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message);
    }
}


// ********** FOR SHOWING LOGIN OR USER PROFILE OPTION IN NAVIGATION BAR **********
const isNavUser = async (req,res,next)=>{
    try {
        if(req.session && req.session.userid){
            res.locals.userNavbar = true;
            return next() 
        }else{
            res.locals.userNavbar = false;
            return next();
        }
    } catch (error) {
        console.log(error);
    }
} 

module.exports = {
    isLogin,
    isLogout,
    isNavUser
}