const Users = require('../models/userModel')
const Order = require('../models/orderModel')



// ********** FOR RENDERING ADMIN LOGIN PAGE **********
const loadAdminLogin = async (req,res)=>{
    try{
        let error = req.flash('error')
        res.render('adminLogin',{error})
    }
    catch(error){
        console.log(error);
    }
}

  
// ********** FOR VERIFYING ADMIN EMAIL AND PASSWORD **********
const adminVerifyLogin = async (req, res) => {
    try {
        const adminEmail = req.body.adminEmail;
        const adminPassword = req.body.adminPassword;

        if (adminEmail === process.env.adminEmail) {
            if (adminPassword === process.env.adminPassword) {
                req.session.admin = { email: adminEmail };
                res.render('adminDashboard')
            } else {
               
                req.flash('error', 'Email or Password is incorrect');
                
                res.redirect('/admin');
            }
        } else {
            req.flash('error', 'Email or Password is incorrect');
            res.render('adminLogin', { error: req.flash('error') });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};


// ********** FOR ADMIN LOGOUT FUNCTION **********
const adminLogout = async (req,res)=>{
    try {
        req.session.admin = null;
        res.redirect('/admin')
    } catch (error) {
        console.log(error);
    }
}


// ********** FOR RENDERING USER LIST **********
const loadUserList = async (req,res)=>{
    try {
        const userData = await Users.find()
        res.render('userList',{ users : userData})
    } catch (error) {
        console.log(error);
    }
}


// ********** FOR BLOCK & UNBLOCK USERS **********
const userStatus = async (req,res)=>{
    try {
                const userId = req.query.userId;
            // console.log(userId);
            
            const user = await Users.findOne({_id:userId})
            // console.log(user);
            if(!user){
                return res.status(404).json({success:false})
            }
            let newStatus ;
            if(user.is_blocked){
                newStatus = false;
            }else{
                newStatus = true
            }

            await Users.findByIdAndUpdate(userId,{$set:{is_blocked: newStatus}})
            res.json({success : true , is_blocked : newStatus})

    } catch (error) {
        console.log(error)
    }
}



// ********** FOR RENDERING SALES REPORT PAGE **********
const loadSalesReport = async (req,res)=>{
    try {
        const order = await Order.find().populate('games.gameId').populate('userId')
        let orders = [...order].reverse()
        
        
        res.render('salesReport',{orders})
    } catch (error) {
        console.log(error);
    }
} 


// ********** FOR FILERTING ORDERS ON THE BASIS OF PERIOD AND SPECIFIC DATE **********
const filterSalesReport = async (req,res)=>{
    try {
        const { startDate, endDate, sortField } = req.query;

        if (!startDate ||!endDate) {
            return res.status(400).send('Both startDate and endDate are required.');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

       
        const query = {
            orderDate: {
                $gte: start,
                $lte: end,
            },
        };

        
        let sortOption = {};
        if (sortField) {
            sortOption = {[sortField]: 1}; 
        }

       
        const orders = await Order.find(query).sort(sortOption).populate('games.gameId').populate('userId')
        
        res.render('salesReport',{orders})
    } catch (error) {
        console.log(error);
    } 
}



module.exports = {
    loadAdminLogin,
    adminVerifyLogin,
    adminLogout,
    loadUserList,
    userStatus, 


    loadSalesReport,
    filterSalesReport
}



