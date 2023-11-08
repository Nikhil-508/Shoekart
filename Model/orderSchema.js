const mongoose = require('mongoose')
const products = require('../Model/productSchema')


const orderSchema = new mongoose.Schema(
    {
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Users",
            required:true
        },
        orderId:{
            type:String,
            unique:true,
            required:true,
        },
        delilveryAddress:{
            type:String,
            required:true
        },
        date:{
            type:Date,
          
        },
        product : [{
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"products",
                required:true,
            },
            quantity:{
                type:Number,
                required:true
            },
            price:{
                type:Number,
                required:true
            },
            totalProductAmount:{
                type:Number,
                required:true
            },
            orderStatus:{
                type:String
            }
        }],
        total:{
            type:Number
        },
        discount:{
            type:Number
        },
        paymentType:{
            type:String,
            required:true
        },
        status :{
            type:String,
            default:"pending"
        }

    }
)



module.exports = mongoose.model('orders',orderSchema)