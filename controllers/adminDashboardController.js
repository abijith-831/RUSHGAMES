const loadDashboard = async (req,res)=>{
    try {
        res.render('adminDashboard')
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadDashboard
}