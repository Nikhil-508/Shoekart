const mongoose = require('mongoose')
const userOtpVerification = new mongoose.Schema({
    userID : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    Email : {
        type:String,
        require:true
    },
    otp:String,
    createdAt:Date,
    expireAt:Date
})

module.exports = mongoose.model('userOtpVerification',userOtpVerification)
