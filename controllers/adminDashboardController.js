const Order = require('../models/orderModel')
const Games = require('../models/gameModel')
const Category = require('../models/categoryModel')



// ********** FOR RENDERING ADMIN DASHBOARD **********
const loadDashboard = async (req,res)=>{
    try {
        const orders = await Order.find();
        const games = await Games.find({ gameSalesCount : {$gt : 0} }).sort({ gameSalesCount : -1 }).limit(10)
        const categories = await Category.find({ categorySalesCount : {$gt :0} }).sort({ categorySalesCount : -1 })

        
        const orderCount = await Order.countDocuments()

        const totalOrderAmount =  orders.reduce((acc,curr)=>{
            return acc=acc+curr.totalCartPrice
        },0)


        let gameCount = 0;
        for(let i=0;i<orders.length;i++){
            const games = orders[i].games
            for(let i=0;i<games.length;i++){
                gameCount += games[i].quantity
            }
        }            
        
        res.render('adminDashboard',{ orderCount , totalOrderAmount , gameCount , games , categories})
    } catch (error) {
        console.log(error);
    }
}



// ********** FOR SORTING CHART IN DASHBOARD **********
const chartSortby = async (req, res) => {
    try {
      const { sortby } = req.body;
  
      let data = {};

      const getWeekDay = { $dayOfWeek: "$orderDate" };
      const getMonth = { $month: "$orderDate" };
      const getQuarter = { $ceil: { $divide: [{ $month: "$orderDate" }, 3] } };
  
      
      // ************** Weekly sales *********
      if (sortby === "weekly") {
        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weeklySales = await Order.aggregate([
          {
            $group: {
              _id: getWeekDay,
              totalSales: { $sum: "$totalCartPrice" }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);
   
        const dailyOrders = Array(7).fill(0);
        weeklySales.forEach(sale => {
          dailyOrders[sale._id - 1] = sale.totalSales;
        });
  
        data = {
          labels: weekDays,
          datasets: [
            {
              label: "Daily Sales",
              backgroundColor: "rgb(30, 133, 230)",
              data: dailyOrders
            }
          ]
        };
      }
  
      //*********** Monthly sales *************
      else if (sortby === "monthly") {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlySales = await Order.aggregate([
          {
            $group: {
              _id: getMonth,
              totalSales: { $sum: "$totalCartPrice" }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);
  
        const monthlyOrders = Array(12).fill(0);
        monthlySales.forEach(sale => {
          monthlyOrders[sale._id - 1] = sale.totalSales;
        });
  
        data = {
          labels: months,
          datasets: [
            {
              label: "Monthly Sales",
              backgroundColor: "rgb(243, 153, 18)",
              data: monthlyOrders
            }
          ]
        };
      }
  
      //********* Yearly sales **************
      else if (sortby === "yearly") {
        const quarterlySales = await Order.aggregate([
          {
            $group: {
              _id: getQuarter,
              totalSales: { $sum: "$totalCartPrice" }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);
  
        const quarterlyOrders = Array(4).fill(0);
        quarterlySales.forEach(sale => {
          quarterlyOrders[sale._id - 1] = sale.totalSales;
        });
  
        data = {
          labels: ["Q1", "Q2", "Q3", "Q4"],
          datasets: [
            {
              label: "Yearly Sales",
              backgroundColor: "rgb(2, 141, 37)",
              data: quarterlyOrders
            }
          ]
        };
      }
  
      res.json(data);
  
    } catch (error) {
      console.log(error);
    }
};
  


const loadAccessories = async (req,res)=>{
    try {
        res.render('accessories')
    } catch (error) {
        console.log(error);
    }
}



const loadAddAccessories = async(req,res)=>{
    try {
        res.render('addAccessories')
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    loadDashboard,
    chartSortby,


    loadAccessories,
    loadAddAccessories

}