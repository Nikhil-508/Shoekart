
const mongoose = require('mongoose')
const { array } = require('../Middleware/multer')

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        is_block: {
            type: Boolean,
            default: false
        },
        is_verified: {
            type: Boolean,
            default: false
        },

        cart: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products"
                },
                quantity: {
                    type: Number,
                    default: 1
                },
                productAmount: {
                    type: Number,
                }
            }
        ],
        totalCartAmount: {
            type: Number,
            default:0
      },
        resetToken: String,  //for forgotpassword function
        resetTokenExpiration: Date,  
      
    }
)


module.exports = mongoose.model('Users', userSchema)
