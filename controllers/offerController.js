const Games = require('../models/gameModel')
const GameOffer = require('../models/gameOfferModel')
const Category = require('../models/categoryModel')
const CategoryOffer = require('../models/categoryOfferModel')


// ********** FOR RENDERING GAME OFFER LIST  **********
const loadgameOfferList = async (req,res)=>{
    try {
        const games = await Games.find({is_listed : true})
        const gameOffer = await GameOffer.find().populate('gameId')
        res.render('gameOfferList' , { games , gameOffer})
    } catch (error) {
        console.log('error');
    }
}



// ********** FOR ADDING GAME OFFER  **********
const addGameOffer = async (req,res)=>{
    try {
        const  { gameId , discount , expiryDate } = req.body;
        
        const gameOffer = new GameOffer ({
            gameId,
            discount,
            startDate : Date.now(),
            expiryDate,
        })
        await gameOffer.save();
        res.json({success : true})

    } catch (error) {
        console.log('error');
    }
}


// ********** FOR CHANGING THE STATUS OF GAME OFFER  **********
const gameOfferStatus = async (req , res)=>{
    try {
        const { gameOfferId } = req.body;
        const gameOffer = await GameOffer.findOne({_id : gameOfferId})
        
        gameOffer.is_active = !gameOffer.is_active;
        await gameOffer.save();
        res.json({success : true , newStatus : gameOffer.is_active})
    } catch (error) {
        console.log(error);
    }
}



// ********** FOR RENDERING CATEGORY OFFER LIST  **********
const loadCategoryOfferList = async ( req , res)=>{
    try {
        const categories = await Category.find({is_listed : true})
        const categoryOffer = await CategoryOffer.find().populate('categoryId')
        
        res.render('categoryOfferList',{categories , categoryOffer})
    } catch (error) {
        console.log(error);
    }
}


// ********** FOR ADDING CATEGORY OFFER  **********
const addCategoryOffer = async (req,res)=>{
    try {
        const { categoryId , discount , expiryDate } = req.body;

        const categoryOffer = new CategoryOffer ({
            categoryId,
            discount,
            startDate : Date.now(),
            expiryDate
        })

        await categoryOffer.save();
        res.json({success : true}) 
    } catch (error) {
        console.log(error);
    }
}


// ********** FOR CHANGING THE STATUS OF CATEGORY OFFER  **********
const categoryOfferStatus= async (req,res)=>{
    try {
        const { categoryOfferId } = req.body;
        const categoryOffer = await CategoryOffer.findOne({_id : categoryOfferId});

        categoryOffer.is_active = !categoryOffer.is_active;
        await categoryOffer.save();
        res.json ({success : true , newStatus : categoryOffer.is_active})
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    loadgameOfferList,
    addGameOffer,
    gameOfferStatus,

    loadCategoryOfferList,
    addCategoryOffer,
    categoryOfferStatus
}