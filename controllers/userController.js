const User = require("../models/userModel");
const Category = require('../models/categoryModel')
const Games = require('../models/gameModel')
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const UserOTPVerification = require("../models/userOTPVerification");
const Coming = require('../models/comingSoonModel')
const GameOffers = require('../models/gameOfferModel')
const CategoryOffers = require('../models/categoryOfferModel')
const Message = require('../models/messageModel')



// ********** PASSWORD HASHING FUNCTION **********
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};



// ********** FOR LOADING HOME PAGE  **********
const loadHome = async (req, res) => {
  try {
    let user = req.session.user_id;
    const categories = await Category.find();  

 
    if(user){
      const messageData = await Message.findOne({ userId: user }, { messages: 1 });
      let unreadMessage = 0
      if(messageData){
        let  unreadMessage = messageData.messages.filter(item => item.is_readed === false).length
      }

      const userData = await User.findById(user);
      if(userData.is_blocked){
        req.session.user_id = null
        res.redirect('/login');
        return;
      }else{
        res.render("home", { user: userData , categories , unreadMessage});
      }
    }else{
      res.render('home',{categories})
    }
      
  } catch (error) {
    console.log(error);
    
  }
};

 

// ********** FOR LOADING LOGIN PAGE **********
const loadLogin = async (req, res) => {
  try {
    let errmsg = req.flash("errmsg");
    let success = req.flash("success");

    res.render("login", { errmsg, success });
  } catch (error) {
    console.log(error);
    
  }
};


// ********** FOR ADDING THE NEW USER TO DATABASE **********
const registerUser = async (req, res) => {
  try {
    const exist = await User.findOne({ email: req.body.email });
    if (exist) {
      req.flash("errmsg", "Email Already Exists...!!!");
      res.redirect("/register");
    } else {
      const spassword = await securePassword(req.body.password);
      const newUser = User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: spassword,
        confirmPassword: spassword,
        is_verified: false,
        is_blocked: false,
      });

      await newUser.save();

      sendOTPVerifymail(newUser, res);
    }
  } catch (error) {
    console.log(error);
    
  }
};



// ********** VERIFYING THE USER LOGIN DETAILS **********
const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const userData = await User.findOne({ email: email });
    if (userData) {
      
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        
        if (!userData.is_blocked) {
          
          if (!userData.is_verified) {
            sendOTPVerifymail(userData, res);
            return res.json({ success: false, error: "Please verify your email." });
          } else {

            req.session.user_id = userData._id;
            return res.json({ success: true, message: "Login successful!" });
          }
        } else {

          return res.json({ success: false, error: "You are blocked by the admin. Please contact the admin." });
        }
      } else {
        return res.json({ success: false, error: "Email or password is incorrect." });
      }
    } else {

      return res.json({ success: false, error: "Email or password is incorrect." });
    }
  } catch (error) {
    req.flash("errmsg", "An error occurred. Please try again later.");
    res.redirect("/login");
  }
};


// ********** VERIFYING THE FORGOT PASSWORD EAMIL **********
const verifyForgotEmail = async (req,res)=>{
  try {
    const {email} = req.body
    const userData = await User.findOne({email : email})
    if(!userData){
      res.json({success : false , message : "nouser"})
    }

    await sendOTPVerifyForgotMail(userData, res);
  } catch (error) {
    console.log(error);
  }
}



// ********** FOR RENDERING THE FOTGOT OTP PAGE **********
const loadForgotOTPPage = async(req,res)=>{
  try {

    const { email } = req.query

    let errmsg = req.flash('errmsg')
    res.render('forgotOTPPage' , { email : email , errmsg})
  } catch (error) {
    console.log(error);
  }
}
 


// ********** VERIFYING THE FORGOT EMAIL **********
const sendOTPVerifyForgotMail = async ({ email }, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: true,
      requireTLS: true,
      auth: {
        user: "officialwoodstreet831@gmail.com",
        pass: "kbcv ratp wleh dqjg",
      },
    });

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(otp);

    const mailOptions = {
      from: "officialwoodstreet831@gmail.com",
      to: email,
      subject: "Verify Your Email",
      html: ` hi... Your OTP is : ${otp}`,
    };

    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);

    const newOTPVerification = new UserOTPVerification({
      email: email,
      otp: hashedOTP,
    });
    await newOTPVerification.save();
    await transporter.sendMail(mailOptions);

    res.json({ success: true, email: email });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};



// ********** FOR RESENDING OTP **********
const resendOTP = async (req, res) => {
  try {
    const userEmail = req.query.email;
    await UserOTPVerification.deleteMany({ email: userEmail });
    if (userEmail) {
      sendOTPVerifymail({ email: userEmail }, res);
    } else {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
    
  }
};



// ********** FOR SENDING OTP VERIFICATION EMAIL **********
const sendOTPVerifymail = async ({ email }, res) => {
  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: true,
      requireTLS: true,
      auth: {
        user: "officialwoodstreet831@gmail.com",
        pass: "kbcv ratp wleh dqjg",
      },
    });

    // Generate random OTP
    // let otp = '';
    // const digits = '0123456789';
    // for (let i = 0; i < 4; i++) {
    //     otp += digits[Math.floor(Math.random() * digits.length)];
    // }
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(otp);

    const mailOptions = {
      from: "officialwoodstreet831@gmail.com",
      to: email,
      subject: "Verify Your Email",
      html: ` hi... Your OTP is : ${otp}`,
    };

    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);


    const newOTPVerification = new UserOTPVerification({
      email: email,
      otp: hashedOTP,
    });
    await newOTPVerification.save();
    await transporter.sendMail(mailOptions);

    res.redirect(`/otp?email=${email}`);
  } catch (error) {
    console.log(error.message);
    
  }
};
 


// ********** FOR LOADING OTP ENTERING PAGE **********
const loadOTP = async (req, res) => {
  try {
    const email = req.query.email;
    let errmsg = req.flash("errmsg");
    let success = req.flash("success");
    res.render("otpVerification", { errmsg, success, email: email });
  } catch (error) {
    console.log(error.message);
    
  }
};



// ********** FOR VERYFYING FORGOT PASSWORD OTP **********
const verifyForgotOTP = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.digit1 + req.body.digit2 + req.body.digit3 + req.body.digit4;

    const userVerification = await UserOTPVerification.findOne({ email: email });

    if (!userVerification) {
      return res.render("forgotOTPPage", {
        email,
        errmsg: "OTP Expired. Please resend OTP and try again.",
      });
    }

    const { otp: savedOTP } = userVerification;
    const otpMatch = await bcrypt.compare(otp, savedOTP);

    if (otpMatch) {
      await userVerification.deleteOne({ email: email });
      res.redirect(`/changePassword?email=${email}`);
    } else {
      res.render("forgotOTPPage", {
        email,
        errmsg: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    console.log(error);
    res.render("otpVerification", {
      email,
      errmsg: "An error occurred. Please try again later.",
    });
  }
};



// ********** FOR RENDERING CHANGING PASSWORD PAGE **********
const changePassword = async (req,res)=>{
  try {
    let errmsg = req.flash('errmsg')
    const email = req.query.email

    res.render('changePassword' , { errmsg , email})
  } catch (error) {
    console.log(error);
  }
}

 

// ********** FOR CHANGING THE NEW PASSWORD **********
const changePasswordSubmit = async(req,res)=>{
  try {
    const { email ,  password , confirmPassword } = req.body

    if (password !== confirmPassword) {
      return res.render('changePassword', { email , errmsg: "Passwords do not match.",});
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.render('changePassword', {
        email,
        errmsg: "User not found.",
      });
    }

    const isSamePassword = await bcrypt.compare(password, user.password);

    if (isSamePassword) {
      return res.render('changePassword', {
        email,
        errmsg: "New password cannot be the same as the old password.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    req.flash("success", "Password changed successfully. Please login with your new password.");
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
}


 
// ********** OTP VERIFICATION FUNCTION **********
const verifyOTP = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.digit1 + req.body.digit2 + req.body.digit3 + req.body.digit4;
      console.log('typed otp : '+otp);
    const userVerification = await UserOTPVerification.findOne({email: email}).sort({createtAt : -1})
      
    if (!userVerification) {
      res.render("otpVerification", {
        email,
        errmsg: "OTP Expired . Please resend OTP and try again.",
      });
    }
    const { otp: savedOTP } = userVerification;
    const otpMatch = await bcrypt.compare(otp, savedOTP);
    
    if (otpMatch) {

      const userData = await User.findOne({ email: email });

      if (userData) {
        await User.findByIdAndUpdate(
          { _id: userData._id },
          { $set: { is_verified: true } }
        );
      }
      const user = await User.findOne({ email: email });
      await userVerification.deleteOne({ email: email })

      if (user.is_verified) {
        if (!user.is_blocked) {
          req.session.user_id = user._id;

          res.redirect("/home");
        } else {
          req.flash("errmsg", "You are Blocked by the Admin");
          res.redirect("/login");
        }
      }
    } else {
      res.render("otpVerification", {
        email,
        errmsg: "Invalid OTP . Please try again later",
      });
    }
  } catch (error) {
    console.log(error);
    
  }
};


// ********** FOR LOGOUT USER **********
const userLogout = async (req, res) => {
  try {
    req.session.user_id = null;
    req.session.name = null;
    res.redirect("/login");
  } catch (error) {
    console.log(error);
    
  }
};


// ********** FOR LOADING THE REGISTER PAGE **********
const loadRegister = async (req, res) => {
  try {
    let errmsg = req.flash("errmsg");
    res.render("registration", { errmsg });
  } catch (error) {
    console.log(error);
    
  }
};


// ********** FOR LOADING THE ABOUT US PAGE **********
const loadAboutUs = async (req, res) => {
  try {
    let user = req.session.user_id;
    const userData = await User.findOne({ _id: user });
    res.render("aboutUs",{user:userData});
  } catch (error) {
    console.log(error);
    
  }
};


// ********** FOR LOADING THE CONTACT US PAGE **********
const loadContactUs = async (req, res) => {
  try {
    let user = req.session.user_id;
    const userData = await User.findOne({ _id: user });
    res.render("contactUs",{user:userData});
  } catch (error) {
    console.log(error);
    
  }
};



// ********** FOR RENDERING ALL PRODUCTS PAGE **********
const loadAllGames = async (req, res) => {
  try {
    const userId = req.session.user_id;
    
    const [userData, categories, allGames, gameOffers, categoryOffers] = await Promise.all([
      User.findOne({_id: userId}),
      Category.find({ is_listed: true }),
      Games.find({ is_listed: true }),
      GameOffers.find({ is_active: false }),
      CategoryOffers.find({ is_active: false })
    ]);

    const categoryIds = categories.map(category => category._id);
    const isPostRequest = req.method === 'POST';
    const { filterCategories = categoryIds, sortCriteria = '', search = '' } = isPostRequest ? req.body : {};

    await Promise.all(categories.map(async (category) => {
      const categoryOffer = categoryOffers.find(item => item.categoryId.equals(category._id));
      if (categoryOffer) {
        await Games.updateMany(
          { category: category._id },
          { $set: { categoryOffer: categoryOffer.discount || null } }
        );
      }
    }));
 

    await Promise.all(allGames.map(async (game) => {
      const gameOffer = gameOffers.find(item => item.gameId.equals(game._id));
      const categoryDiscount = game.categoryOffer;
      const gameDiscount = gameOffer ? gameOffer.discount : null;

      let finalPrice = game.price;
      if (gameDiscount && !categoryDiscount) {
        finalPrice = Math.round(game.price - (game.price * gameDiscount / 100));
      } else if (!gameDiscount && categoryDiscount > 0) {
        finalPrice = Math.round(game.price - (game.price * categoryDiscount / 100));
      } else if (gameDiscount && categoryDiscount) {
        const bigDiscount = Math.max(gameDiscount, categoryDiscount);
        finalPrice = Math.round(game.price - (game.price * bigDiscount / 100));
      }

      await Games.findByIdAndUpdate(
        game._id,
        { $set: { gameOffer: gameDiscount, finalPrice } },
        { new: true }
      );

      const gameCategory = await Category.findById(game.category);
      if (gameCategory) {
        game.categoryName = gameCategory.name;
      }
    }));

    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;


    let sortOrder = {};
    if (sortCriteria === 'priceLow-High') {
      sortOrder.finalPrice = 1;
    } else if (sortCriteria === 'priceHigh-Low') {
      sortOrder.finalPrice = -1;
    } else if (sortCriteria === 'nameA-Z') {
      sortOrder.name = 1;
    } else if (sortCriteria === 'nameZ-A') {
      sortOrder.name = -1;
    }

    let baseQuery = { is_listed: true };
    if (filterCategories.length > 0) {
      baseQuery.category = { $in: filterCategories };
    }
    if (search.trim() !== '') {
      baseQuery.name = { $regex: search, $options: 'i' };
    }

 
    const filteredGames = await Games.find(baseQuery).sort(sortOrder).populate('category');

    const games = filteredGames.slice(skip, skip + limit);
    const totalGames = filteredGames.length;
    const totalPages = Math.ceil(totalGames / limit);

    let prevPage = page - 1;
    let nextPage = page + 1;
    if (prevPage < 1) prevPage = 1;
    if (nextPage > totalPages) nextPage = totalPages;

    if (isPostRequest) {
      return res.json(games);
    }

    res.render("allGames", {
      categories,
      games,
      user: userData,
      totalPages,
      prevPage,
      nextPage,
      page,
      number: allGames.length
    });

  } catch (error) {
    console.log(error);
  }
};



 
// ********** FOR RENDERING GAME DETAILS PAGE **********
const loadGameDetails = async (req,res)=>{
  try {
    let userId = req.session.user_id;
    const gameId = req.query.id;

    const [ userData , gameDetails] = await Promise.all([
      User.findOne({_id : userId}),
      Games.findById(gameId).populate('category')
    ])
   
    const gameItem = { gameId: { id: gameId } };

    res.render('gameDetailsPage', { gameDetails, game: gameDetails, gameItem, user: userData });
  } catch (error) {
    console.log(error);
  }
}

 

const loadComingSoon = async (req ,res)=>{
  try {

    const userId = req.session.user_id;
        
    const userData = await User.findOne({_id : userId})
    const comings = await Coming.find()

    res.render('comingSoon',{comings , user : userData})
  } catch (error) {
    console.log(error);
    
  }
}

  
const loadComingSoonDetails = async (req,res)=>{
  try {

    const userId = req.session.user_id;
        
    const userData = await User.findOne({_id : userId})

    const gameId = req.query.id;
    const game = await Coming.findOne({_id:gameId}).populate('category')
    
    res.render('comingSoonDetails',{game , user : userData})
  } catch (error) {
    console.log(error);
    
  }
}
 

module.exports = { 

  loadHome,
  loadAllGames,
  loadGameDetails,


  loadLogin,
  loadRegister,
  verifyOTP,
  //-------
  verifyForgotEmail,
  loadForgotOTPPage,
  sendOTPVerifyForgotMail,
  verifyForgotOTP,
  changePassword,
  changePasswordSubmit,



  registerUser,
  verifyLogin,
  securePassword,
  loadOTP,
  userLogout,
  sendOTPVerifymail,
  resendOTP,
  loadAboutUs,
  loadContactUs,


  loadComingSoon,
  loadComingSoonDetails


};
