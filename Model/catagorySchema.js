const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        addedDate:{
            type:Date,
            default:Date.now()
        },
        description:{
            type:String,
            required:true
        }
    }
)

module.exports = mongoose.model('categories',categorySchema)

