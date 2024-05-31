const Users = require('../models/userModel')


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


module.exports = {
    loadAdminLogin,
    adminVerifyLogin,
    adminLogout,
    loadUserList,
    userStatus , 
    
}



