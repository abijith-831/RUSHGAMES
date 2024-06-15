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

        const totalOrderAmount =  orders.reduce((acc,order)=>{
            return acc=acc+order.totalCartPrice
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
const chartSortby = async (req,res)=>{
    try {
        const { sortby } = req.body;
        const orders = await Order.find();
        
        const daysInWeek = (dateString) => new Date (dateString).getDay()
        const MonthsInYear = (dateString) => new Date(dateString).getMonth();
        const getQuarterOfYear = (dateString) => Math.ceil(new Date(dateString).getMonth() / 3);        
        
        let data = 0


        // *******weekly sales **********
        if(sortby === 'weekly'){
            const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            const dailyOrders = Array(7).fill(0)

            orders.forEach(item=>{
                const days = daysInWeek(item.orderDate)
                dailyOrders[days] += item.totalCartPrice
            })
            data = {
                labels: weekDays,
                datasets: [
                    {
                        label: 'Daily Sales',
                        backgroundColor: 'rgb(30, 133, 230)',
                        data: dailyOrders
                    }
                ]
            };
        }
        // *******Monthly sales **********
        else if (sortby === 'monthly'){
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            const monthlyOrders = Array(12).fill(0)

            orders.forEach(item=>{
                const month = MonthsInYear(item.orderDate)-1
                monthlyOrders[month] += item.totalCartPrice
            })
            data = {
                labels: months,
                datasets: [
                    {
                        label: 'Monthly Sales',
                        backgroundColor: 'rgb(243, 153, 18)',
                        data: monthlyOrders
                    }
                ]
            };
        }
        // *******yearly sales **********
        else if (sortby === 'yearly'){
            const quarterlySales = Array(4).fill(0);

            orders.forEach(order => {
                const quarter = getQuarterOfYear(order.orderDate);
                quarterlySales[quarter - 1] += order.totalCartPrice; 
            });
            data = {
                labels: ["Q1", "Q2", "Q3", "Q4"],
                datasets: [
                    {
                        label: 'Yearly Sales',
                        backgroundColor: 'rgb(2, 141, 37)',
                        data: quarterlySales
                    }
                ]
            };
        }

        res.json(data);
        
    } catch (error) {
        console.log(error);
    }
}



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