const User = require("../models/userModel");
const Category = require('../models/categoryModel')
const Games = require('../models/gameModel')
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const UserOTPVerification = require("../models/userOTPVerification");


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
    console.log(user);
    const userData = await User.findOne({ _id: user });
    const categories = await Category.find();
    res.render("home", { user: userData , categories});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};


// ********** FOR LOADING LOGIN PAGE **********
const loadLogin = async (req, res) => {
  try {
    let errmsg = req.flash("errmsg");
    let succmsg = req.flash("success");

    res.render("login", { errmsg, succmsg });
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

      // ********** SETTING EXPIRATION TIME OF REGISTERED DATAS IN ONE MINUTE **********
      // const expTime = new Date()
      // expTime.setMinutes(expTime.getMinutes()+1)

      // newUser.expiresAt = expTime

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
        if (userData.is_verified) {
          if (!userData.is_blocked) {
            req.session.user_id = userData._id;
                
            res.redirect("/home?verified = true");
          } else {
            req.flash(
              "errmsg",
              "You are Blocked By the Admin . Please Contact the Admin"
            );
            res.redirect("/login");
          }
        } else {
          sendOTPVerifymail(userData, res);
        }
      } else {
        // console.log("wrong");
        req.flash("errmsg", "Email or Password is Incorrect...!!!");
        res.redirect("/login");
      }
    }
  } catch (error) {
    console.log(error);
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

    // Hash the OTP
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);

    // Save hashed OTP to database
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


// ********** OTP VERIFICATION FUNCTION **********
const verifyOTP = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.digit1 + req.body.digit2 + req.body.digit3 + req.body.digit4;
      
    const userVerification = await UserOTPVerification.findOne({email: email});
      
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
      await userVerification.deleteOne({ email: email });

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
    let errmsg = req.flash('errmsg')
    let user = req.session.user_id;
    const userData = await User.findOne({_id:user})
    const categories = await Category.find({ is_listed: true });
    const categoryIds = categories.map(category => category._id);
    
    const games = await Games.find({ category: { $in: categoryIds }, is_listed:true});
   
    for(let game of games){
      const gameCategory = await Category.findById(game.category);
      if(gameCategory){
        game.categoryName = gameCategory.name
      }
    }
    res.render("allGames",{categories , games:games,user:userData,errmsg});
  } catch (error) {
    console.log(error);
  }
};


const sortGamesAlphabetically = async(req,res)=>{
  try {
    const games = await Games.find({})
    const sort = games.sort((a,b)=>a.name.localeCompare(b.name))
    res.json(sort)
  } catch (error) {
    console.log(error);
  }
}

const loadGameDetails = async (req,res)=>{
  try {
    let user = req.session.user_id;
    const userData = await User.findOne({_id:user})
    const gameId = req.query.id;
    const gameDetails = await Games.findById(gameId).populate('category')
    const game = await Games.findById(gameId).populate('category')
    const gameItem = { gameId: { id: gameId } };
    res.render('gameDetailsPage',{gameDetails,game,gameItem,user:userData})
  } catch (error) {
    console.log(error);
  }
}




module.exports = {

  loadHome,
  loadAllGames,
  sortGamesAlphabetically,
  loadGameDetails,
  loadLogin,
  loadRegister,
  verifyOTP,

  registerUser,
  verifyLogin,
  securePassword,
  loadOTP,
  userLogout,
  sendOTPVerifymail,
  resendOTP,
  loadAboutUs,
  loadContactUs,


};