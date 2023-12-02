const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema(
    {
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"product",
            required:true
        },
        discountPercentage:{
            type: Number,
            required:true,
        },
        startDate:{
            type:Date,
            required:true,
        },
        endDate:{
            type:Date,
            required:true,
        }
    }
)

const Offer = mongoose.model('Offer',offerSchema)

module.exports = Offer