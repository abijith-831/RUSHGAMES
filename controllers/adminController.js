const Users = require('../models/userModel')
const Order = require('../models/orderModel')
const ExcelJS = require('exceljs')
const PDFDocument = require('pdfkit');



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



// ********** FOR DOWNLOADING SALES REPORT AS EXCEL FORMAT **********
const downloadExcel = async(req,res)=>{
    try {
        
        const { orders } = req.body
        console.log('Orders:', JSON.stringify(orders , null ,2));

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('orders')

        worksheet.columns = [
            { header: 'SL.NO', key: 'slNo', width: 10 },
            { header: 'DATE', key: 'date', width: 20 },
            { header: 'CUSTOMER', key: 'customer', width: 30 },
            { header: 'ORDER-ID', key: 'orderId', width: 20 },
            { header: 'PRODUCT', key: 'product', width: 30 },
            { header: 'PRICE', key: 'price', width: 15 },
            { header: 'OFFER', key: 'offer', width: 15 },
            { header: 'FINAL PRICE', key: 'finalPrice', width: 15 },
            { header: 'STATUS', key: 'status', width: 15 },
        ];

        let index = 1 ;
        let sumPrice = 0;
        let sumOffer = 0;
        let sumFinalPrice = 0;

        orders.forEach(order =>{
            order.games.forEach(item =>{
                worksheet.addRow({
                    slNo: index++,
                    date: new Date(order.orderDate).toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
                    customer: order.userId.name,
                    orderId: order.orderId,
                    product: item.gameId.name,
                    price: item.gameId.price,
                    offer: item.gameId.price - item.price,
                    finalPrice: item.price,
                    status: item.Status
                })
                sumPrice += item.gameId.price;
                sumOffer += (item.gameId.price - item.price);
                sumFinalPrice += item.price;
            })
            
        })
        
        worksheet.addRow({});
        worksheet.addRow({
            slNo: '',
            date: '',
            customer: '',
            orderId: '',
            product: '',
            price: 'Total',
            offer: '',
            finalPrice: '',
            status: ''
        });

        worksheet.addRow({
            slNo: '',
            date: '',
            customer: '',
            orderId: '',
            product: '',
            price: sumPrice,
            offer: sumOffer,
            finalPrice: sumFinalPrice,
            status: ''
        });

        const buffer = await workbook.xlsx.writeBuffer();
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=RGorders.xlsx');
        res.send(buffer);
    } catch (error) {
        console.log(error);
    }
} 
 
 

// ********** FOR DOWNLOADING SALES REPORT AS PDF FORMAT *********
const downloadPDF = async (req, res) => {
    try {
        const { orders } = req.body;

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=RGorders.pdf');

        doc.pipe(res);

        // Title
        doc.fontSize(20).text('RUSH GAMES - SALES REPORT', { align: 'center' });
        doc.moveDown();


         const columnWidths = {
            slNo: 50,
            date: 100,
            customer: 100,
            orderId: 80,
            product: 150,
            price: 80,
            offer: 80,
            finalPrice: 100,
            status: 80,
        };
        
        const tableHeader = ['NO', 'DATE', 'USER', 'ORDER-ID', 'PRODUCT', 'PRICE', 'OFFER', 'FINAL', 'STATUS'];
        const cellWidth = 60;
        const tableStartX = 10;
        let currentX = tableStartX;
        const startY = doc.y;
        const rowHeight = 20;

        tableHeader.forEach(header => {
            doc.fontSize(12).font('Helvetica-Bold').text(header, currentX, startY);
            currentX += cellWidth;
        });

        
        let index = 1;
        let sumPrice = 0;
        let sumOffer = 0;
        let sumFinalPrice = 0;

        let currentY = startY + rowHeight;
        orders.forEach(order => {
            order.games.forEach(item => {
                currentX = tableStartX;
                const rowData = [
                    index++,
                    new Date(order.orderDate).toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                    order.userId.name,
                    order.orderId,
                    item.gameId.name,
                    item.gameId.price,
                    item.gameId.price - item.price,
                    item.price,
                    item.Status
                ];
                sumPrice += item.gameId.price;
                sumOffer += (item.gameId.price - item.price);
                sumFinalPrice += item.price;

                rowData.forEach(data => {
                    doc.fontSize(10).font('Helvetica').text(data.toString(), currentX, currentY);
                    currentX += cellWidth;
                });

                currentY += rowHeight;
            });
        });

        

        const totalRowData = ['', '', '', '', 'Total', sumPrice, sumOffer, sumFinalPrice, ''];
        currentX = tableStartX;
        totalRowData.forEach(data => {
            doc.fontSize(10).font('Helvetica-Bold').text(data.toString(), currentX, currentY);
            currentX += cellWidth;
        });

        doc.end();
    } catch (error) {
        console.log(error);
        res.status(500).send('An error occurred while generating the PDF.');
    }
};



module.exports = {
    loadAdminLogin,
    adminVerifyLogin,
    adminLogout,
    loadUserList,
    userStatus, 


    loadSalesReport,
    filterSalesReport,
    downloadExcel,
    downloadPDF
}



