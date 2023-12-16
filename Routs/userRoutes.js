const express = require("express")
const userRouter = express()
const auth = require('../Middleware/auth')


const userController = require("../Controller/userController")

userRouter.set('views','./View/User')
userRouter.get("/",userController.getHome)


//>>>>>>>>>>>>>>>>> user login <<<<<<<<<<<<<<<<<<<

userRouter.get("/login", auth.userAuth ,userController.getLogin)
userRouter.post("/login", auth.userAuth ,userController.doLogin)


//>>>>>>>>>>>>>>>>> user signup <<<<<<<<<<<<<<<<<<

userRouter.get("/signup",userController.getSignup)
userRouter.post('/signup',userController.doSignUp)


//>>>>>>>>>>>>>>>>>> forgotpassword handling <<<<<<<<<<<<<<<<<<<<

userRouter.get("/forgotPassword",userController.getForgotPassword)
userRouter.post("/forgotPassword",userController.forgotpasswordEmail)
userRouter.get("/resetPassword/:token",userController.getResetPage)
userRouter.post("/resetPassword",userController.resetPassword)


//>>>>>>>>>>>>>>>>>> get allshoes <<<<<<<<<<<<<<<<<<<<

// userRouter.get('/products',auth.realuserauth,userController.getAllShoes)
userRouter.get('/productsByCategory',userController.getproductsByCategory)


//>>>>>>>>>>>>>>>>>> get singleproduct <<<<<<<<<<<<<<<<<<<<

userRouter.get('/singleProduct/:productId',auth.realuserauth,userController.getSingleProduct)


//>>>>>>>>>>>>>>>>>> cart management <<<<<<<<<<<<<<<<<<<<

userRouter.get('/mycart',auth.realuserauth,userController.getCart)
userRouter.get('/add-to-cart/:productId',auth.realuserauth,userController.addToCart)
userRouter.post('/updateQuantity',auth.realuserauth,userController.updateQuantity)
userRouter.post('/remove-from-cart/:proId',auth.realuserauth,userController.removeFromCart)

//get checkout
userRouter.get("/checkout",auth.realuserauth,userController.getCheckout)

//placeorder
userRouter.post("/placeOrder",auth.realuserauth,userController.placeOrder)

//redeem coupon
userRouter.post("/redeemCoupon",auth.realuserauth,userController.redeemCoupon)

//succsespage rendering 
userRouter.get("/successfull",auth.realuserauth,userController.successPage)

//>>>>>>>>>>>>>>>>>>>> paymentverification <<<<<<<<<<<<<<<<<<<<<<

userRouter.post("/verifyPayment",auth.realuserauth,userController.verifyPayment)


// >>>>>>>>>>>>>>>>>>>>get successPage <<<<<<<<<<<<<<<<<<<<<<

userRouter.get("/successful",userController.getSuccesful)



//>>>>>>>>>>>>>>>>>>> order Management <<<<<<<<<<<<<<<<<<<<<<

userRouter.get('/orders',auth.realuserauth,userController.getorders)
userRouter.post('/updateOrderStatus',auth.realuserauth,userController.userupdateOrderStatus)


//>>>>>>>>>>>>>>>>>>>>  user Profile management <<<<<<<<<<<<<<<<<<<<<<

userRouter.get('/user-profile',auth.realuserauth,userController.getUserProfile)
userRouter.get('/user-addAddress',auth.realuserauth,userController.getUserAddAddress)
userRouter.post('/user-addAddress',auth.realuserauth,userController.UserAddAddress)
userRouter.get('/user-editAddress/:addressId',auth.realuserauth,userController.getEditAddress)
userRouter.post('/user-editAddress/:addressId',auth.realuserauth,userController.EditAddress)
userRouter.get('/user-DeleteAddress/:addressId',auth.realuserauth,userController.DeleteAddress)
userRouter.get('/user-editprofile',auth.realuserauth,userController.getEditProfile)
userRouter.post('/user-editprofile/:userId',auth.realuserauth,userController.EditProfile)


////>>>>>>>>>>>>>>>>>>>> password handling <<<<<<<<<<<<<<<<<<<<<<

userRouter.get('/user-changePassword',auth.realuserauth,userController.getChangePassword)
userRouter.post('/user-changePassword',auth.realuserauth,userController.changePassword)




//user logout
userRouter.post('/logout',userController.doLogout)

// otp verification
userRouter.get('/otp-verification',userController.getOtppage)
userRouter.post('/otp-verification',userController.checkOtpValid)

module.exports = userRouter

