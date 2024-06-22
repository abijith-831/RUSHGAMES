const dotenv = require('dotenv')
dotenv.config()

const express = require('express')
const app =  express()
const mongoose = require('mongoose');
const nocache = require('nocache')
const path = require('path')
const flash=require('express-flash')
const session = require('express-session')
// const googleAuth = require('./googleAuth')


app.use(session({
    secret:process.env.SESSION_SECRET,
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

app.use(errorHandler)

//FOR USER ROUTES
const userRoute = require('./Routes/userRoute')
app.use('/',userRoute)




//FOR ADMIN ROUTES
const adminRoute = require('./Routes/adminRoute')
app.use('/admin',adminRoute)

// app.use('/',googleAuth)

// connecting database
mongoose.connect(process.env.MONGODB_URL)
.then(()=>{
    console.log("Mongodb Connected");
}).catch((err)=>{
    console.log("Failed to Connect Mongodb"+err);
})


const port = process.env.PORT

//LISTENING TO THE PORT
app.listen(port,()=>{
    console.log(`server running on http://localhost:${port}/admin/dashboard`);
    console.log(`server running on http://localhost:${port}`);
})


