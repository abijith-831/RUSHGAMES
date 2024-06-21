const Users = require('../models/userModel')
const Message = require('../models/messageModel')


 
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
const isNavUser = async (req, res, next) => {
    try {
      if (req.session && req.session.user_id) {
        res.locals.userNavbar = true;
  
        const messageData = await Message.findOne({ userId: req.session.user_id }, { messages: 1 });
        const unreadMessageCount = messageData ? messageData.messages.filter(item => !item.is_readed).length : 0;
        res.locals.unreadMessage = unreadMessageCount;
  
        return next();
      } else {
        res.locals.userNavbar = false;
        res.locals.unreadMessage = 0;
        return next();
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  

module.exports = {
    isLogin,
    isLogout,
    isNavUser
}