const express = require('express')

const user_route = express()
const userController=require('../controllers/userController')
const profileController = require('../controllers/profileController')
const cartController = require('../controllers/cartController')
const wishlistController = require('../controllers/wishlistController')
const checkOutController = require('../controllers/checkOutController')
const path = require('path')


user_route.set('view engine','ejs')
user_route.set('views','./views/users')
const userAuth = require('../middleware/userAuth')



user_route.use(express.static(path.join(__dirname,'public')))
user_route.use(express.static(path.join(__dirname,'public/uploads')))


//******  USER REGISTRATION  ******
user_route.get('/register',userAuth.isLogout,userController.loadRegister)
user_route.post('/register',userController.registerUser)
user_route.get('/otp',userController.loadOTP)
user_route.post('/verifyotp',userController.verifyOTP)
user_route.get('/resendOTP',userController.resendOTP)


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


//******   USER CART SECTIONS ******
user_route.get('/cart' , userAuth.isLogin , cartController.loadCart)
user_route.post('/addToCart' ,  userAuth.isLogin , cartController.addGameToCart)
user_route.put('/removeFromCart' , userAuth.isLogin , cartController.removeFromCart)
user_route.post('/updateCartQuantity' , cartController.updateCartQuantity)


//******   WISHLIST SECTION ******
user_route.get('/wishlist' , userAuth.isLogin , wishlistController.loadWishlist)
user_route.post('/addToWishlist' , wishlistController.addToWishlist) 
user_route.put('/removeFromWishlist' , userAuth.isLogin , wishlistController.removeFromWishlist)
user_route.post('/addToCartAndRemove',wishlistController.addToCartAndRemove)


//******   CCHECKOUT SECTION ******  
user_route.get('/checkOut' , userAuth.isLogin , checkOutController.loadCheckOut)
user_route.post('/addNewAddress' , checkOutController.addNewAddress)
user_route.post('/placeOrder',checkOutController.placeOrder)


//******   USER ADDRESS SECTIONS ******
user_route.get('/addresses' ,userAuth.isLogin , profileController.loadAddresses)
user_route.post('/addNewAddress',profileController.addNewAddress)
user_route.post('/deleteAddress',profileController.deleteAddress)


//******   FOR RENDERING OTHER PAGES ******
user_route.get('/aboutUs',userController.loadAboutUs)
user_route.get('/contactUs',userController.loadContactUs)


user_route.get('/allGames',userController.loadAllGames)
user_route.post('/sortGamesAlphabetically',userController.sortGamesAlphabetically)
user_route.get('/gameDetails',userController.loadGameDetails)


user_route.get('*', (req, res) => {
    console.log('Caught by catch-all route');
    res.render('404');
});



module.exports = user_route;