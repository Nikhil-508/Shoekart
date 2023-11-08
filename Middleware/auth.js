const express = require('express')
const session = require('express-session')

//user Authentication checking for signup and otp

const userAuth = (req,res,next)=>{
    try {
        if(!req.session.userId){
            next()
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error);
    }
}

const realuserauth = (req,res,next)=>{
    try {
        if(req.session.userId){
            next()
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error);
        
    }
}


//Admin Authentication checking

const adminAuth = (req,res,next)=>{
    try {
        if(!req.session.adminId){
            res.redirect('/admin/login')
        }else{
            next()
        }
    } catch (error) {
        console.log(error);    
    }
}

module.exports = {userAuth,adminAuth,realuserauth}