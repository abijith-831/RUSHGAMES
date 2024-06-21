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
                res.redirect('/admin/dashboard')
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
            
            const user = await Users.findOne({_id:userId})
  
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
const loadSalesReport = async (req, res) => {
    try {

        const page = parseInt(req.query.page)||1;
        const limit = 10 ;
        const skip = (page-1)*limit;

        const orderData = await Order.find().populate('games.gameId').populate('userId');
        const pageData = await Order.find().populate('games.gameId').populate('userId')
        let orders = [...orderData].reverse();
        let pagesOrders = [...pageData].reverse();
        

        let sumPrice = 0;
        let sumOffer = 0;
        let sumFinalPrice = 0;

        
        const forEachedOrders = orders.map(order => {
            return order.games.map(item => {
                const gamePrice = item.gameId.price;
                const offerPrice = gamePrice - item.price;
                const finalPrice = item.price;

             
                sumPrice += gamePrice;
                sumOffer += offerPrice;
                sumFinalPrice += finalPrice;

                return {
                    
                    orderDate: new Date(order.orderDate).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    userName: order.userId.name,
                    orderId: order.orderId,
                    gameName: item.gameId.name,
                    gamePrice: gamePrice,
                    offerPrice: offerPrice,
                    finalPrice: finalPrice,
                    status: item.Status
                }; 
            });
        }).flat();

        let sumPagePrice = 0
        let sumPageOffer = 0
        let sumPageFinalPrice = 0
        
        const pagedData = pagesOrders.map(order=>{
            return order.games.map(item=>{
                const pageGamePrice = item.gameId.price;
                const pageOfferPrice = pageGamePrice - item.price;
                const pageFinalPrice = item.price;

                sumPagePrice += pageGamePrice;
                sumPageOffer += pageOfferPrice;
                sumPageFinalPrice += pageFinalPrice;

                return {
                    
                    orderDate: new Date(order.orderDate).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    userName: order.userId.name,
                    orderId: order.orderId,
                    gameName: item.gameId.name,
                    pageGamePrice: pageGamePrice,
                    pageOfferPrice: pageOfferPrice,
                    pageFinalPrice: pageFinalPrice,
                    status: item.Status
                }; 
            })
        }).flat();
        
        const paginatedOrders = pagedData.slice(skip, skip + limit);
        
        const totalGames = forEachedOrders.length;
        
        const totalPages = Math.ceil(totalGames/limit)
        
        let prevPage = page - 1;
        let nextPage = page + 1;
        if(prevPage < 1) prevPage = 1;
        if(nextPage > totalPages) nextPage = totalPages

        res.render('salesReport', {
            orders: paginatedOrders,
            forEachedOrders,
            sumPrice,
            sumOffer,
            sumFinalPrice,
            prevPage,
            nextPage,
            totalPages,
            currentPage: page,
            limit,
            page,
            filterParams : req.query.filterParams || ''
        });
    } catch (error) {
        console.log(error);
    }
};   

 

// ********** FOR FILERTING ORDERS ON THE BASIS OF PERIOD AND SPECIFIC DATE **********
const filterSalesReport = async (req,res)=>{
    try {
        const { startDate, endDate, sort } = req.query;
        
        const filter = (startDate && endDate);
        let filterParams = '';
        if(filter){
            filterParams = `&startDate=${startDate}&endDate=${endDate}`;
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
        if (sort) {
            sortOption = {[sort]: 1}; 
        }
        
        const orders = await Order.find(query).sort(sortOption).populate('games.gameId').populate('userId')
        
        let sumPrice = 0;
        let sumOffer = 0;
        let sumFinalPrice= 0;
        
        const forEachedOrders = orders.map(order=> {
            return order.games.map(item=>{
                const gamePrice = item.gameId.price;
                const offerPrice = gamePrice - item.price;
                const finalPrice = item.price

                sumPrice += gamePrice;
                sumOffer += offerPrice;
                sumFinalPrice += finalPrice;

                return {
                    orderDate: new Date(order.orderDate).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    userName: order.userId.name,
                    orderId: order.orderId,
                    gameName: item.gameId.name,
                    gamePrice: gamePrice,
                    offerPrice: offerPrice,
                    finalPrice: finalPrice,
                    status: item.Status
                }
            })
        }).flat();
        
        const page = parseInt(req.query.page)||1;
        const limit = 10 ;
        const skip = (page-1)*limit;
        
        const paginatedOrders = forEachedOrders.slice(skip, skip + limit);
        
        const totalGames = forEachedOrders.length;
        
        const totalPages = Math.ceil(totalGames/limit)

        let prevPage = page - 1;
        let nextPage = page + 1;
        if(prevPage < 1) prevPage = 1;
        if(nextPage > totalPages) nextPage = totalPages

        res.render('salesReport',{orders:paginatedOrders ,
            forEachedOrders,
            filterParams: filterParams,
            sumPrice ,
            sumFinalPrice ,
            sumOffer,
            prevPage,
            nextPage,
            totalPages,
            currentPage: page,
            limit,
            page
        })
    } catch (error) {
        console.log(error);
    } 
}
 


// ********** FOR DOWNLOADING SALES REPORT AS EXCEL FORMAT **********
const downloadExcel = async (req, res) => {
    try {
        const { forEachedOrders } = req.body;
        console.log('Orders:', JSON.stringify(forEachedOrders, null, 2));

        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        
        worksheet.columns = [
            { header: 'SL.NO', key: 'slNo', width: 10 },
            { header: 'Order Date', key: 'orderDate', width: 20 },
            { header: 'User Name', key: 'userName', width: 20 },
            { header: 'Order ID', key: 'orderId', width: 20 },
            { header: 'Game Name', key: 'gameName', width: 30 },
            { header: 'Game Price', key: 'gamePrice', width: 15 },
            { header: 'Offer Price', key: 'offerPrice', width: 15 },
            { header: 'Final Price', key: 'finalPrice', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
        ];


        let sumPrice = 0;
        let sumOffer = 0;
        let sumFinalPrice = 0;
        
        forEachedOrders.forEach((order, index) => {
            worksheet.addRow({
                slNo: index + 1,
                orderDate: order.orderDate,
                userName: order.userName,
                orderId: order.orderId,
                gameName: order.gameName,
                gamePrice: order.gamePrice,
                offerPrice: order.offerPrice,
                finalPrice: order.finalPrice,
                status: order.status,
            });
            sumPrice += order.gamePrice
            sumOffer += (order.finalPrice - order.gamePrice);
            sumFinalPrice += order.finalPrice
        });
        
        worksheet.addRow({});
        worksheet.addRow({
            slNo: '',
            orderDate: '',
            userName: '',
            orderId: '',
            gameName: 'Totals',
            gamePrice: sumPrice,
            offerPrice: sumOffer,
            finalPrice: sumFinalPrice,
            status: ''
        });

        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

        
        await workbook.xlsx.write(res);
        res.status(200).end();

    } catch (error) {
        console.error('Error generating Excel file:', error);
        res.status(500).send('Error generating Excel file');
    }
};
 

// ********** FOR DOWNLOADING SALES REPORT AS PDF FORMAT *********
const downloadPDF = async (req, res) => {
    try {
        const { forEachedOrders } = req.body;

        const doc = new PDFDocument({ margin: 30 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=RGorders.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('RUSH GAMES - SALES REPORT', { align: 'center' });
        doc.moveDown();

        const tableHeader = ['NO.', 'Order Date', 'Name', 'Order ID', 'Game Name', 'Price', 'Offer Price', 'Final Price', 'Status'];
        const cellWidths = [30, 90, 60, 60, 110, 50, 60, 60, 50];
        const tableStartX = 10;
        const startY = doc.y;
        const rowHeight = 20;
        const headerBackgroundColor = '#FFA500' ;


        let currentX = tableStartX;
        doc.fillColor(headerBackgroundColor);
        tableHeader.forEach((header, index) => {
            doc.rect(currentX, startY, cellWidths[index], rowHeight).fill();
            currentX += cellWidths[index];
        });


        currentX = tableStartX;
        doc.fillColor('black'); 
        tableHeader.forEach((header, index) => {
            doc.fontSize(10).font('Helvetica-Bold').text(header, currentX, startY + 5, { width: cellWidths[index], align: 'left' });
            currentX += cellWidths[index];
        });


        let sumPrice = 0;
        let sumOffer = 0;
        let sumFinalPrice = 0;
        let currentY = startY + rowHeight;



        forEachedOrders.forEach((order, index) => {
            currentX = tableStartX;
           

            const rowData = [
                index + 1,
                order.orderDate,
                order.userName,
                order.orderId,
                order.gameName,
                order.gamePrice.toFixed(2),
                order.offerPrice.toFixed(2),
                order.finalPrice.toFixed(2),
                order.status
            ];
            sumPrice += order.gamePrice;
            sumOffer += order.offerPrice;
            sumFinalPrice += order.finalPrice;

            rowData.forEach((data, i) => {
                doc.fontSize(8).font('Helvetica').text(data.toString(), currentX, currentY, { width: cellWidths[i], align: 'left' });
                currentX += cellWidths[i];
            });

            currentY += rowHeight;


            if (currentY > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
                currentY = startY;

                currentX = tableStartX;
                doc.fillColor('black');
                tableHeader.forEach((header, index) => {
                    doc.fontSize(10).font('Helvetica-Bold').text(header, currentX, currentY + 5, { width: cellWidths[index], align: 'left' });
                    currentX += cellWidths[index];
                });

                currentY += rowHeight;
            }
        });

        const totalRowData = ['', '', '', '', 'Total', sumPrice.toFixed(2), sumOffer.toFixed(2), sumFinalPrice.toFixed(2), ''];
        currentX = tableStartX;
        totalRowData.forEach((data, i) => {
            doc.fontSize(8).font('Helvetica-Bold').text(data.toString(), currentX, currentY, { width: cellWidths[i], align: 'left' });
            currentX += cellWidths[i];
        });

        doc.end();
    } catch (error) {
        console.error(error);
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



