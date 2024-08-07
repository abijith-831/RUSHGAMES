const express = require('express')

const user_route = express()
const userController=require('../controllers/userController')
const profileController = require('../controllers/profileController')
const cartController = require('../controllers/cartController')
const wishlistController = require('../controllers/wishlistController')
const checkOutController = require('../controllers/checkOutController')
const path = require('path')



user_route.set('views','./views/users')
const userAuth = require('../middleware/userAuth')
const errorHandler = require('../middleware/errorHandler')



user_route.use(express.static(path.join(__dirname,'public')))
user_route.use(express.static(path.join(__dirname,'public/uploads')))


user_route.use(userAuth.isNavUser);



//******  USER REGISTRATION  ******
user_route.get('/register',userAuth.isLogout,userController.loadRegister)
user_route.post('/register',userController.registerUser)
user_route.get('/otp',userController.loadOTP)
user_route.post('/verifyotp',userController.verifyOTP)
user_route.get('/resendOTP',userController.resendOTP)



//******  FORGOT PASSWORD SECTION ******
user_route.post('/verifyForgotEmail',userController.verifyForgotEmail)
user_route.get('/forgotOTP',userController.loadForgotOTPPage)
user_route.post('/verifyForgotOTP',userController.verifyForgotOTP)
user_route.get('/changePassword',userController.changePassword)
user_route.post('/changePasswordSubmit',userController.changePasswordSubmit)

//******   USER LOGIN AND LOGOUT ******
user_route.get('/login' , userAuth.isLogout , userController.loadLogin)
user_route.post('/loginSubmit' , userController.verifyLogin)
user_route.get('/' , userAuth.isNavUser , userController.loadHome)
user_route.get('/home', userAuth.isLogout , userController.loadHome)
user_route.get('/logout', userAuth.isLogin , userController.userLogout)




//******   USER PROFILE SECTIONS ******
user_route.get('/userProfile' , userAuth.isLogin , profileController.loadUserProfile)
user_route.post('/editUserProfile',profileController.editUserProfile)
user_route.post('/editUserPassword',profileController.editUserPassword)
//----------------
user_route.get('/orderHistory', userAuth.isLogin , profileController.loadOrderHistory)
user_route.post('/repayment',profileController.repayment)
user_route.post('/verifyRepayment',profileController.verifyRepayment)

user_route.get('/orderDetailsPage', userAuth.isLogin, profileController.loadOrderDetailsPage)
user_route.post('/downloadInvoice',profileController.downloadInvoice) 
user_route.post('/cancelOrder',profileController.cancelOrder)
user_route.post('/returnOrder',profileController.returnOrder)
//---------------- 
user_route.get('/wallet',userAuth.isLogin ,profileController.loadWallet)
user_route.post('/addMoneyToWallet',profileController.addMoneyToWallet)
user_route.post('/withdrawMoney',profileController.withdrawMoney)
//-----------------
user_route.get('/coupons',userAuth.isLogin , profileController.loadCoupons)
user_route.post('/checkCoupon',profileController.checkCoupon)


//******   USER CART SECTIONS ******
const {loadCart} = require('../controllers/cartController')
user_route.get('/cart' , userAuth.isLogin , cartController.loadCart)
user_route.post('/addToCart' ,  userAuth.isLogin , cartController.addGameToCart)
user_route.put('/removeFromCart' , userAuth.isLogin , cartController.removeFromCart)
user_route.put('/update-cart' , cartController.updateCartQuantity)


//******   WISHLIST SECTION ******
user_route.get('/wishlist' , userAuth.isLogin , wishlistController.loadWishlist)
user_route.post('/addToWishlist' , wishlistController.addToWishlist) 
user_route.put('/removeFromWishlist' , userAuth.isLogin , wishlistController.removeFromWishlist)
user_route.post('/addToCartAndRemove',wishlistController.addToCartAndRemove)
//-----------------------
user_route.get('/loadNotification',userAuth.isLogin ,wishlistController.loadNotification)



//******   CHECKOUT SECTION ******  
user_route.get('/checkOut' , userAuth.isLogin , checkOutController.loadCheckOut)
user_route.post('/addNewAddress' , checkOutController.addNewAddress)
user_route.post('/placeOrder' , checkOutController.placeOrder)
user_route.get('/success',userAuth.isLogin,checkOutController.LoadSuccessPage)
user_route.post('/verifyPayment',checkOutController.verifyPayment)



//******   USER ADDRESS SECTIONS ******
user_route.get('/addresses' ,userAuth.isLogin , profileController.loadAddresses)
user_route.get('/editAddress', userAuth.isLogin,profileController.editAddress)
user_route.post('/submitEditAddress',profileController.submitEditAddress)
user_route.post('/addNewAddress',profileController.addNewAddress)
user_route.post('/deleteAddress',profileController.deleteAddress)


//******   FOR RENDERING OTHER PAGES ******
user_route.get('/aboutUs',userAuth.isNavUser,userController.loadAboutUs)
user_route.get('/contactUs',userController.loadContactUs)
user_route.get('/comingSoon',userController.loadComingSoon)
user_route.get('/comingSoonDetails',userController.loadComingSoonDetails)



user_route.get('/allGames',userAuth.isNavUser,userController.loadAllGames)
user_route.post('/allGames',userController.loadAllGames)
user_route.get('/gameDetails',userController.loadGameDetails)



// user_route.get('*', (req, res) => {
//     res.render('404');
// });


module.exports = user_route;