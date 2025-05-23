const dotenv = require('dotenv')
dotenv.config()

const express = require('express')
const app =  express()
const mongoose = require('mongoose');
const nocache = require('nocache')
const path = require('path')
const flash=require('express-flash')
const session = require('express-session')
const googleAuth = require('./googleAuth')


app.use(session({
    // secret:process.env.SESSION_SECRET,
    secret :'AIzaSyBMVIEY--RIGTPOSOiAPr_otL0ZBMulKeU',
    resave: false,
    saveUninitialized: true,
}))

app.use(nocache());
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({extended:true}))



app.use(express.static(path.join(__dirname,'public')))
app.use(express.static(path.join(__dirname,'public/uploads')))


app.set('view engine','ejs')


const errorHandler = require('./middleware/errorHandler')



//FOR USER ROUTES
const userRoute = require('./Routes/userRoute')
app.use('/',userRoute)




//FOR ADMIN ROUTES
const adminRoute = require('./Routes/adminRoute')
app.use('/admin',adminRoute)

app.use('/',googleAuth)

// 404 fallback (no need to render a view)
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});


app.use(errorHandler)


// connecting database
// mongoose.connect(process.env.MONGODB_URL)
mongoose.connect('mongodb+srv://abhijithasokan831:LdleFyRSceZ7EPUz@rushgamez.ani0zld.mongodb.net/?retryWrites=true&w=majority&appName=rushgamez')
.then(()=>{
    console.log("Mongodb Connected");
}).catch((err)=>{
    console.log("Failed to Connect Mongodb"+err);
})


const port = process.env.PORT || 7000;

//LISTENING TO THE PORT
app.listen(port,()=>{
    console.log(`server running on http://localhost:${port}/admin/dashboard`);
    console.log(`server running on http://localhost:${port}`);
})


