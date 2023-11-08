const express = require("express")
const userRouter = express()
const auth = require('../Middleware/auth')

// userRouter.set("views", "./View/User") 

const userController = require("../Controller/userController")

userRouter.set('views','./View/User')

userRouter.get("/",userController.getHome)

//user login 
userRouter.get("/login", auth.userAuth ,userController.getLogin)
userRouter.post("/login", auth.userAuth ,userController.doLogin)

//forgotpassword handling
userRouter.get("/forgotPassword",userController.getForgotPassword)
userRouter.post("/forgotPassword",userController.forgotpasswordEmail)
userRouter.get("/resetPassword/:token",userController.getResetPage)
userRouter.post("/resetPassword",userController.resetPassword)

//get allshoes
userRouter.get('/all-shoes',auth.realuserauth,userController.getAllshoes)

//get singleproduct
userRouter.get('/singleProduct/:productId',auth.realuserauth,userController.getSingleProduct)


//get cart
userRouter.get('/mycart',auth.realuserauth,userController.getCart)
userRouter.get('/add-to-cart/:productId',auth.realuserauth,userController.addToCart)
userRouter.post('/updateQuantity',auth.realuserauth,userController.updateQuantity)
userRouter.post('/remove-from-cart/:proId',auth.realuserauth,userController.removeFromCart)

//get checkout
userRouter.post("/checkout/:proId",auth.realuserauth,userController.getCheckout)

//placeorder
userRouter.post("/placeOrder",auth.realuserauth,userController.placeOrder)

//succsespage rendering
userRouter.get("/successfull",auth.realuserauth,userController.successPage)

//paymentverificati
userRouter.post("/verifyPayment",auth.realuserauth,userController.verifyPayment)

//get successPage
userRouter.get("/successful",userController.getSuccesful)

//orders
userRouter.get('/orders',auth.realuserauth,userController.getorders)


//get user Profile
userRouter.get('/user-profile',auth.realuserauth,userController.getUserProfile)

userRouter.get('/user-addAddress',auth.realuserauth,userController.getUserAddAddress)
userRouter.post('/user-addAddress',auth.realuserauth,userController.UserAddAddress)
userRouter.get('/user-editAddress/:addressId',auth.realuserauth,userController.getEditAddress)
userRouter.post('/user-editAddress/:addressId',auth.realuserauth,userController.EditAddress)
userRouter.get('/user-DeleteAddress/:addressId',auth.realuserauth,userController.DeleteAddress)
//Address handling
userRouter.get('/user-editprofile',auth.realuserauth,userController.getEditProfile)
userRouter.post('/user-editprofile/:userId',auth.realuserauth,userController.EditProfile)
//password handling
userRouter.get('/user-changePassword',auth.realuserauth,userController.getChangePassword)
userRouter.post('/user-changePassword',auth.realuserauth,userController.changePassword)




//user logout
userRouter.post('/logout',userController.doLogout)


//user signup
userRouter.get("/signup",userController.getSignup)
userRouter.post('/signup',userController.doSignUp)


// otp verification

userRouter.get('/otp-verification',userController.getOtppage)
userRouter.post('/otp-verification',userController.checkOtpValid)

module.exports = userRouter

