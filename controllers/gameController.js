const Category = require("../models/categoryModel");
const Games = require("../models/gameModel");
const ComingSoon = require('../models/comingSoonModel')
const multer = require("multer");
const path = require("path");
const express = require("express");
const app = express();
const sharp = require('sharp')


// ********** FOR LOADING GAMESLIST **********
const loadGamesList = async (req, res) => {
  try {
    
    let success = req.flash("success");

    
    const page = parseInt(req.query.page)||1;
    const limit = 10;
    const skip = (page-1)*limit;
    const games = await Games.find().skip(skip).limit(limit)
    for (let game of games) {
      const category = await Category.findById(game.category);
      if (category) {
        game.categoryName = category.name;
      }
    }
    const totalGames = await Games.countDocuments();
    const totalPages = Math.ceil(totalGames/limit)

    let prevPage = page - 1;
    let nextPage = page + 1;
    if(prevPage < 1 ) prevPage = 1;
    if(nextPage > totalPages) nextPage = totalPages
    
    res.render("gamesList", { games, success , totalPages , totalGames , prevPage , nextPage , page , limit});
  } catch (error) {
    console.log(error);
  }
};


// ********** FOR LOADING ADD GAMES **********
const loadAddGames = async (req, res) => {
  try {
    let errmsg = req.flash("errmsg");
    const categories = await Category.find();
    res.render("addGames", { categories, errmsg });
  } catch (error) {
    console.log(error);
  }
};


// ********** MULTER SETTNGS **********
const location = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "public/uploads");
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + "-" + file.originalname);
  },
});


const upload = multer({ storage: location }).fields([
  { name: "mainImage", maxCount: 1 },
  { name: "screenshotImages", maxCount: 4 },
    
]);

const coming = multer({ storage: location }).fields([
  { name: "image", maxCount: 1 },   
]);


app.use(express.static(path.join(__dirname, "public")));


// ********** FOR INSERTING NEW GAME DETAILS **********

const addGames = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        req.flash("errmsg", "Images should not exceed 5");
        return res.redirect("/admin/addGames");
      }

      const name = req.body.name.trim().toUpperCase();
      const alreadyExist = await Games.findOne({ name });
      if (alreadyExist) {
        req.flash("errmsg", "This Game is already Added. Please try a Different Game");
        return res.redirect("/admin/addGames");
      }

      
      const mainImageFile = req.files['mainImage'][0]; 
      const mainImage = {
        filename: mainImageFile.filename,
        path: "/uploads/" + mainImageFile.filename,
      };

      const screenshotFiles = req.files['screenshotImages'];
      if(screenshotFiles.length !== 4){
        req.flash('errmsg',"You need to Insert 4 Screenshots...")
        return res.redirect('/admin/addGames')
      }
      const screenshotImages = screenshotFiles.map(file=>({
            filename : file.filename,
            path : '/uploads/'+file.filename
      }))
      

      const newGame = new Games({
        name,
        category: req.body.category,
        price: req.body.price,
        stock: req.body.quantity,
        systemReq: req.body.systemReq,
        mainImage,
        screenshotImages,
        trailer : req.body.trailer
      });

      await newGame.save();

      req.flash("success", "Game Added Successfully...");
      res.redirect("/admin/gamesList");
    });
  } catch (error) {
    console.log(error);
    req.flash("errmsg", "An error occurred while adding the game");
    res.redirect("/admin/addGames");
  }
};


// ********** FOR RENDERING EDIT GAMES PAGE **********
const loadEditGames = async (req,res)=>{
  try {
    const categories = await Category.find()
    const id = req.query.gameId;
    const gameDetails = await Games.findOne({_id:id})
    let errmsg = req.flash('errmsg')
    res.render('editGames',{gameDetails,gameId:id,categories,errmsg})
  } catch (error) {
    console.log(error);
  }
}


// ********** FOR MODIFYING GAME DETAILS **********
const editGames = async(req,res)=>{
  try {
    const gameId = req.body.gameId
    const games = await Games.find()
    const newName = req.body.name.toUpperCase()
    const categoryId = req.body.category;
    
    const currentGame = games.find(game=>game._id==gameId)
    
    if(!currentGame){
      req.flash('errmsg',"Game not found")
      return res.redirect('/admin/editGames')
    }
    //for extracting all game names from Games DB
    
    const gameNames = games.map(x=>x.name).filter(name=>name!== currentGame.name)
    if(gameNames.includes(newName)){
        req.flash('errmsg',"Game Already Exists...")
        res.redirect('/admin/editGames')
    }
        await Games.findByIdAndUpdate(gameId,{
          name : newName,
          category : categoryId,
          price : req.body.price,
          stock : req.body.quantity,
          systemReq : req.body.systemReq,
         
        })
        req.flash('success',"Game Updated Successfully...")
        res.redirect('/admin/gamesList')
    
  } catch (error) {
    console.log(error);
  }
}


// ********** FOR LISTING AND UNLISTING GAMES ********** 
const gameStatus = async (req,res)=>{
  try {
    const gameId = req.query.gameId;
    const game = await Games.findById(gameId)
    
    if(!game){
      return res.status(400).json({success : false})
    }
    let newStatus ; 
    if(game.is_listed){
      newStatus = false
    }else{
      newStatus = true
    }
    await Games.findByIdAndUpdate(gameId,{$set:{is_listed:newStatus}})
    res.json({success:true,newStatus})
  } catch (error) {
    console.log(error);
  }
}



const loadComingSoon = async (req,res)=>{
  try {
    const categories = await Category.find()
    const comings = await ComingSoon.find()
    for (let game of comings) {
      const category = await Category.findById(game.category);
      if (category) {
        game.categoryName = category.name;
      }
    }
    res.render('comingSoonList',{categories , comings})
  } catch (error) {
    console.log(error);
  }
}


const addComingSoonGames = async (req,res)=>{
  try {
    
    coming(req,res,async function (err){
      if (err) {
        console.log(err);
      }
      
      const name = req.body.gameName.trim().toUpperCase()
      const alreadyExist = await Games.findOne({ name });
      if (alreadyExist) {
        req.flash("errmsg", "This Game is already Added. Please try a Different Game");
        return res.redirect("/admin/comingSoonList");
      }
      const alreadyExists = await ComingSoon.findOne({ name });
      if (alreadyExists) {
        req.flash("errmsg", "This Game is already Added. Please try a Different Game");
        return res.redirect("/admin/comingSoonList");
      }
      const mainImageFile = req.files.image[0]
      
      const image = {
        filename : mainImageFile.filename,
        path : '/uploads/'+mainImageFile.filename
      }
      const newGame = new ComingSoon({
        name,
        category: req.body.category,
        systemReq: req.body.systemReq,
        image,
        expectedArrival : req.body.gameArrival
      })
      await newGame.save()
    })
    
    
  } catch (error) {
    console.log(error);
  }
}


module.exports = {
  loadGamesList,
  loadAddGames,
  addGames,
  loadEditGames,
  editGames,
  gameStatus,


  loadComingSoon,
  addComingSoonGames
};
