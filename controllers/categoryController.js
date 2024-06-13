const Category = require("../models/categoryModel");
const { exists } = require("../models/userOTPVerification");


// ********** FOR RENDERING CATEGORY LIST PAGE **********
const loadCategoryList = async (req, res) => {
  try {
    const categories = await Category.find();
    let success = req.flash('success')
    let errmsg = req.flash('errmsg')
    res.render("categoryList", {success,errmsg, categories });
  } catch (error) {
    console.log(error);
    
  }
}; 


// ********** FOR LOADING CATEGORY ADDING PAGE **********
const loadAddCategory = async (req, res) => {
  try {
    let errmsg = req.flash("errmsg");
    let success = req.flash("success");
    res.render("addCategory", { errmsg, success });
  } catch (error) {
    console.log(error);
    
  }
};


// ********** FOR ADDING NEW CATEGORIES **********
const addNewCategory = async (req, res) => {
  const categoryName = req.body.category;

  const capital = categoryName.toUpperCase();

  try {
    const exist = await Category.findOne({ name: capital });
    if (exist) {
      
      req.flash("errmsg", "Category Already Exists...!!!");

      res.redirect("/admin/addNewCategory");
    } else {
      
      const newCategory = new Category({ name: capital });
      await newCategory.save();
      req.flash("success", "Category Added Successfully.");
      res.redirect("/admin/categoryList");
    }
  } catch (error) {
    console.log(error);
    req.flash("errmsg", "Error while Adding Category");
    res.redirect("/admin/addNewCategory");
  }
};


// ********** FOR RENDERING EDIT CATEGORY PAGE **********  
const loadEditCategory = async(req,res)=>{
  try {
    const id = req.query.categoryId;
    const categoryDetails = await Category.findOne({_id:id})
    
    let errmsg = req.flash('errmsg')
    res.render('editCategory',{errmsg,categoryDetails,categoryId:id})
  } catch (error) {
    console.log(error);
    
  }
}


// ********** FOR MODIFYING THE CATEGORY **********
const modifyCategory = async (req,res)=>{
  try {
    const {categoryId} = req.body ; 
    const newName = req.body.categoryName.toUpperCase();
    

    const categories = await Category.find();

    const categoryExists = categories.some(category=>{
      return category.name.toUpperCase()===newName && category._id.toString() !== categoryId ;
    })

    if(categoryExists){
      req.flash('errmsg',"Category Already Exists...!!!");
      res.redirect('/admin/editCategory')
    }else{
      await Category.findByIdAndUpdate(categoryId,{name:newName})
      req.flash('success',"Category Updated Successfully...")
      return res.redirect('/admin/categoryList');

    }
  } catch (error) {
    console.log(error)
    
  }
}



// ********** FOR LISTING AND UNLISTING CATEGORIES ********** 
const categoryStatus = async (req,res)=>{
   try {
      const categoryId = req.query.categoryId;
      const category = await Category.findById(categoryId)
      
      if(!category){
        return res.status(404).json({success:false})
      }
      let newStatus;
      if(category.is_listed){
        newStatus = false
      }else{
        newStatus = true
      }

      await Category.findByIdAndUpdate(categoryId,{$set:{is_listed:newStatus}})
      res.json({success:true,newStatus})

   } catch (error) {
      console.log(error);
      
   }
}

 

module.exports = {
  loadCategoryList,
  loadAddCategory,
  addNewCategory,
  loadEditCategory,
  modifyCategory,
  categoryStatus
};
