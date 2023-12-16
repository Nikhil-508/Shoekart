
const mongoose = require('mongoose')
const { array } = require('../Middleware/multer')

const walletTransactionSchema = new mongoose.Schema({
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  });



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
        wallet:{
            type:Number,
            default:0
        },
        referralCode: {
            type: String,
        },
        referred: {
            type: Boolean,
            required: true,
            default: false,
        },
        referredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        },
        walletTransactions: [walletTransactionSchema],

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



function generateRandomCode(length){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = ''
    for (let i=0; i<length; i++){
        const randomIndex = Math.floor(Math.random()*characters.length)
        code += characters.charAt(randomIndex)
        console.log(code,"codeee")
    }
    return code;
}

userSchema.pre('save', async function(next){
    if(!this.referralCode){
        let uniqueReferralCode;
        do{
            uniqueReferralCode = generateRandomCode(6); //can customise the length of the referral code
        } while (await this.constructor.findOne({referralCode:uniqueReferralCode}))
        this.referralCode = uniqueReferralCode
    }
    next()
})



module.exports = mongoose.model('Users', userSchema)
