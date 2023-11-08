const mongoose = require('mongoose')

const addresSchema = new mongoose.Schema(

        {
            UserId:{
                type:mongoose.Schema.ObjectId,
                ref:"Users",
                required: true
            },
            housename:{
                type:String,
                required:true

            },
            pincode:{
                type:Number,
                required:true
            },
            post:{
                type:String,
                required:true
            },
            district:{
                type:String,
                required:true
            }

        }

)

const address = mongoose.model("address",addresSchema)
module.exports= address