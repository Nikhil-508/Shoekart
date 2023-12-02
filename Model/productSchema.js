const mongoose =require('mongoose')


const productSchema = new mongoose.Schema(
    {
        name : {
            type: String,
            required: true
        },
        category:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'categories',
            // type:String,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        offerpercentage:{
            type:Number
        },
        price:{
            type:Number,
            required:true
        },
        gender:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        colour:{
            type:String,
            required:true
        },
        size:{
            type:Number,
            required:true
        },
        list:{
            type:Boolean,
            required:true,
            default:true
        },
        images:{
            type:Array,
        },
        is_delete:{
            type:Boolean,
            default:false
        }
    }
)

module.exports = mongoose.model('products',productSchema)