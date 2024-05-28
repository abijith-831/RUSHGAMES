const express = require('express')
const admin_route = express()
const path = require('path')
const multer = require('multer')
const upload = require('../config/multer-config')

// ****** CONTROLLERS ******
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const gameController = require('../controllers/gameController')
const adminDashboardController = require('../controllers/adminDashboardController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const offerController = require('../controllers/offerController')


const adminAuth = require('../middleware/adminAuth')

admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')

admin_route.use('/admin/assets', express.static(path.join(__dirname, '../../public/admin/assets')));


admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:true}))


// ****** ADMIN LOG IN AND LOGOUT ******
admin_route.get('/',adminAuth.isLogout,adminController.loadAdminLogin);
admin_route.get('/login',adminAuth.isLogout,adminController.loadAdminLogin);
admin_route.post('/loginSubmit',adminController.adminVerifyLogin)
admin_route.get('/logout',adminController.adminLogout)


// ****** DASHBOARD SECTION ******
admin_route.get('/dashboard',adminDashboardController.loadDashboard)


// ****** USER DETAILS ******
admin_route.get('/userList',adminController.loadUserList)
admin_route.get('/blockUser',adminController.userStatus)
 

// ****** PRODUCT / GAMES SECTION ******
admin_route.get('/gamesList',gameController.loadGamesList)
admin_route.get('/addGames',gameController.loadAddGames)
admin_route.post('/submitGame',gameController.addGames)
admin_route.get('/editGames',gameController.loadEditGames)
admin_route.post('/editGamesSubmit',gameController.editGames)
admin_route.get('/gameStatus',gameController.gameStatus)


// ****** COMING SOON GAMES SECTION ******
admin_route.get('/comingSoonList',gameController.loadComingSoon)
admin_route.post('/addComingSoonGames',gameController.addComingSoonGames)


// ****** CATEGORY CONTROL SECTION ******
admin_route.get('/categoryList',categoryController.loadCategoryList)
admin_route.get('/addCategory',categoryController.loadAddCategory)
admin_route.get('/addNewCategory',categoryController.loadAddCategory)
admin_route.post('/addNewCategory',categoryController.addNewCategory)
admin_route.get('/editCategory',categoryController.loadEditCategory)
admin_route.post('/modifyCategory',categoryController.modifyCategory)
admin_route.get('/categoryStatus',categoryController.categoryStatus)
// admin_route.get('/deleteCategory',categoryController.deleteCategory)


// ****** ORDER MANAGEMENT SECTION ******
admin_route.get('/orderHistory',orderController.loadOrderHistory)
admin_route.get('/adminOrderDetailsPage',orderController.loadAdminOrderDetails)
admin_route.post('/changeStatus',orderController.changeStatus)
admin_route.post('/approveRequest',orderController.approveRequest)
admin_route.post('/rejectRequest',orderController.rejectRequest)

// ****** COUPON HANDINLING SECTION ******
admin_route.get('/couponList',couponController.loadCouponList)
admin_route.post('/addCoupon',couponController.addCoupon)
admin_route.post('/couponStatus',couponController.couponStatus)


admin_route.get('/gameOfferList',offerController.loadgameOfferList)
admin_route.post('/addGameOffer',offerController.addGameOffer)
admin_route.post('/gameOfferStatus',offerController.gameOfferStatus)

admin_route.get('/categoryOfferList',offerController.loadCategoryOfferList)
admin_route.post('/addCategoryOffer',offerController.addCategoryOffer)
admin_route.post('/categoryOfferStatus',offerController.categoryOfferStatus)


module.exports = admin_route; 