const express = require("express")
const path = require('path')
const app = express()
const mongoose = require('mongoose')
const session = require("express-session")
const nocache = require("nocache")
const env = require('dotenv').config()

mongoose.connect('mongodb://127.0.0.1:27017/Shoekart',{
    useNewUrlParser : true,
    useUnifiedTopology : true
})
.then(() => console.log('connected to database'))
.catch((err) => console.log('error connection' , err))


// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

app.use(session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));


const userRouter = require("./Routs/userRoutes")
const adminRouter = require("./Routs/adminRoutes")

// const { default: mongoose } = require("mongoose")

//middleware
app.use(express.static('public'));

app.use(express.json())
app.use(express.urlencoded({extended : true}))

app.use(nocache())

app.use("/admin",adminRouter)
app.use("/",userRouter)


//404 error handling
app.set('views' , './view')
app.use((err, req, res, next) => {
    console.log(err);
    res.render('404error')
  });

app.set("view engine","ejs")

app.listen(3000 , () => console.log('server running'))










