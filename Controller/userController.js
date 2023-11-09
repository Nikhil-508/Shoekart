const Users = require('../Model/userSchema')
const { v4: uuidv4 } = require("uuid")
const bcrypt = require('bcrypt')
const session = require('express-session');
const userOtpVerification = require('../Model/userOtpVerification');
const express = require("express")
const moment = require('moment')
const nodemailer = require('nodemailer')
require('dotenv').config()
const Products = require('../Model/productSchema')
const address = require('../Model/addressSchema');
const Order = require('../Model/orderSchema');
const orderSchema = require('../Model/orderSchema');
const Razorpay = require('razorpay');
const crypto = require('crypto')

//Razorpay instance

var instance = new Razorpay({
    key_id: 'rzp_test_fQpf1jt8afOnex',
    key_secret: 'JdG2FakQQqlUlXItBLeDrxP2',
});







function validateUserInput(req, res, name, email, phone, password) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!name || !email || !phone || !password) {
        return 'All fields are required';
    }

    if (!emailRegex.test(email)) {
        return res.render('signup', { message: "Invalid email address" })

    }
    if (!phoneRegex.test(phone)) {
        return { error: 'Invalid phone number' };
    }

    if (!passwordRegex.test(password)) {
        return res.render('signup', { message: "Invalid password" })
    }

    return null; // No validation errors
}


const getHome = async (req, res) => {
    try {
        res.render('home')

    } catch (error) {
        console.log(error.message);

    }
}

const getLogin = async (req, res) => {
    try {
        res.render('login')

    } catch (error) {
        console.log(error.message);
    }
}

const doLogin = async (req, res, next) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const usermatch = await Users.findOne({ email: email })
        if (!usermatch) {
            return res.render('login', { message: "Invalid email" })
        }
        if (usermatch.is_block) {
            return res.render('login', { message: "User is blocked" });
        }
        const isMatch = await bcrypt.compare(password, usermatch.password)
        if (!isMatch) {
            return res.render('login', { message: "Incorrect password" })

        } else {
            req.session.userId = usermatch._id
            res.redirect("/")
        }
    } catch (error) {
        console.log(error);
    }
}


const getForgotPassword = async(req,res)=>{
    try {
        res.render("forgotPassword")
    } catch (error) {
        console.log(error);
    }
}

const forgotpasswordEmail = async(req,res)=>{
    try {
        const Email = req.body.email
        const user = await Users.findOne({email:Email})
        console.log(user)
        console.log(Email);
        if(!user){
            res.render("forgotPassword",{message:"User not registered"})
        }
         // Generate a reset token
    const resetToken = uuidv4();

    // Save the reset token and its expiration date to the user's record
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // Set an expiration time (e.g., 1 hour)
    await user.save();
    console.log(user);

    //resetlink
    const resetLink = `http://localhost:3000/resetPassword/${resetToken}`;

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: user.email,
        subject: 'Password Reset Request',
        html: `Click <a href="${resetLink}">here</a> to reset your password.`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Password reset email sent.');
        }
      });
  
      res.render('forgotPassword', { message: 'Password reset email sent' });

        
    } catch (error) {
        console.log(error);
    }
}


const getResetPage = async(req,res)=>{
    try {
        const resetToken = req.params.token
        res.render("resetPassword",{resetToken})
    } catch (error) {
        console.log(error);
    }
}


const resetPassword = async(req,res)=>{
    try {
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        const resetToken = req.body.token;
        console.log(newPassword,"neww",confirmPassword);
    
        // Validate the new password
        if (newPassword !== confirmPassword) {
          return res.render('resetPassword', {
            message: 'Passwords do not match',
            resetToken: resetToken,
          });
        }
    
        // Implement the logic to verify the reset token and update the user's password
        // You should check the token's validity and expiration
    
        // Example of updating the user's password (replace this with your actual logic)
        const user = await Users.findOne({ resetToken: resetToken });
    
        if (!user || user.resetTokenExpiration < Date.now()) {
          return res.render('resetPassword', {
            message: 'Invalid or expired reset token',
            resetToken: resetToken,
          });
        }
    
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiration = null;
        await user.save();
    
        // Send an email to notify the user that the password has been successfully reset
        const mailOptions = {
          from: process.env.AUTH_EMAIL,
          to: user.email,
          subject: 'Password Reset Successful',
          text: 'Your password has been successfully reset.',
        };
    
        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            console.log(error);
          } else {
            console.log('Password reset success email sent.');
          }
        });
        // console.log(resetToken,"before");
        res.render('resetPassword', { message: 'Password reset successful', resetToken: resetToken });
        // console.log(resetToken,"after");


    } catch (error) {
        console.log(error);
    }
}

const getSignup = async (req, res) => {
    try {
        res.render('signup')
    } catch (error) {
        console.log(error.message);
    }
}

const doSignUp = async (req, res, next) => {
    try {
        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone
        const password = req.body.password

        const validationError = validateUserInput(req, res, name, email, phone, password);
        console.log(req.body);


        if (validationError) {
            return res.status(400).send(validationError);
        }
        console.log(req.body);
        const userMatch = await Users.findOne({ name: name })
        if (!userMatch) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)
            const user = {
                name: name,
                password: hashedPassword,
                email: email,
                phone: phone
            }
            const userData = new Users(user)
            await userData.save()
            if (userData) {
                //send the verificatioin  email
                sendOtpVerificationEmail(userData, res)
                res.redirect(`/otp-verification?userId=${userData._id}`);

            } else {
                res.status(404).json({ error: "error in sign up" })
            }
        } else {
            res.status(404).json({ error: "user exists" })
        }

    } catch (err) {
        console.log(err);
        res.status(500)
    }
}



const doLogout = (req, res, next) => {
    try {
        if (req.session.userId) {
            req.session.destroy();
            return res.redirect("/login")
        } else {
            return res.redirect('/')
        }

    } catch (error) {
        console.log(error.message);
    }
}


//send email models

let transporter = nodemailer.createTransport({
    service: "Gmail",
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    }
});

const sendOtpVerificationEmail = async ({ _id, email }, res) => {
    try {
        //console.log(_id);
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

        //Mail options
        const mailOption = {
            from: process.env.AUTH_EMAIL, //use the correct environment variable
            to: email,
            subject: "Verify your Email",
            html: `<p>Enter <b>${otp}</b>in the app to verify your emailaddress and complete the verification</p>
                    <p>This code <b> expires in 1 hour</b>.</p>`
        }
        // Hash the OTP
        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        const newOTPVerification = new userOtpVerification({
            userID: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expireAt: Date.now() + 3600000,
        });

        //save the otp

        await userOtpVerification.deleteMany({ userId: _id })
        await newOTPVerification.save()
        //send email
        await transporter.sendMail(mailOption);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: error.message

        });

    }
}



//....Getting OTP page....

const getOtppage = async (req, res) => {
    try {
        const userId = req.query.userId; // Use req.query to retrieve query parameters
        console.log(userId);
        res.render('otpPage', { userId });
    } catch (error) {
        console.log(error);
    }
}

// OTP valid checking

const checkOtpValid = async (req, res) => {
    try {
        const { OTP, ID } = req.body
        console.log(ID);
        if (OTP === '') {
            console.log(OTP);
            return res.render('otpPage', { message: "Empty data is not allowed", userId: ID });
        }
        console.log(OTP);

        const OtpRecord = await userOtpVerification.findOne({ userID: ID })
        console.log(OtpRecord);

        if (!OtpRecord) {
            return res.render('otpPage', { message: "Enter a valid OTP", userID: ID })
        }
        const { expireAt, userId, otp } = OtpRecord
        if (expireAt < Date.now()) {  //checking if otp has expired
            await userOtpVerification.deleteOne({ _id: ID })
            return res.render('otpPage', { message: "The code has expired.please try again", userId: ID })
        }
        const isValid = await bcrypt.compare(OTP, otp);

        if (!isValid) {
            return res.render('otpPage', { message: "The entered OTP  is invalid", userId: ID })
        }

        console.log(ID);
        console.log(ID, typeof ID);
        await Users.updateOne({ _id: ID }, { $set: { is_verified: true } });
        await userOtpVerification.deleteOne({ userID: ID });
        console.log("completed");
        return res.redirect('/login')

    } catch (error) {
        console.log(error);
        res.status(500).send('internal server error')

    }
}



const getAllshoes = async (req, res) => {
    try {
        const products = await Products.find({})
        if (products) {
            res.render("allShoes", { products })
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}



const getSingleProduct = async (req, res) => {
    try {
        const productId = req.params.productId
        const productData = await Products.find({ _id: productId });
        console.log(productData);
        res.render('singleProduct', { productData })
    } catch (error) {
        console.log(error);
    }
}



const getCart = async (req, res) => {
    try {
        const userId = req.session.userId
        const response = await Users.findOne({ _id: userId }).populate("cart.product").select(["cart", "totalCartAmount", "name"])
        // console.log(response.cart);
        res.render('myCart', { response })

    } catch (error) {
        console.log(error);
    }
}


const updateQuantity = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.body.productId;
        const newQuantity = req.body.quantity;

        // Update the quantity in the user's cart
        const user = await Users.findOneAndUpdate(
            { _id: userId, "cart.product": productId },
            { $set: { "cart.$.quantity": newQuantity } },
            { new: true }
        );

        // Calculate the new product amount
        const product = user.cart.find((item) => item.product.toString() === productId);
        const newProductAmount = product.quantity * product.productAmount;

        // Update the totalCartAmount in the user's schema
        user.totalCartAmount = user.cart.reduce((total, item) => total + item.productAmount, 0);
        await user.save();

        res.json({ newProductAmount });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error updating quantity" });
    }
};




const addToCart = async (req, res) => {
    try {
        const userId = req.session.userId
        const productId = req.params.productId
        const productData = await Products.findOne({ _id: productId })
        console.log(productData);
        console.log(productId, userId);
        const response = await Users.updateOne({ _id: userId }, { $push: { cart: { product: productId, productAmount: productData.price } }, $inc: { totalCartAmount: productData.price } })
        console.log(response)
        res.redirect('/mycart')
    } catch (error) {
        358
        console.log(error);
    }
}


const removeFromCart = async (req, res) => {
    try {
        const deleteproduct = req.params.proId
        const currentUser = await Users.findById(req.session.userId);

        const itemIndex = currentUser.cart.findIndex((item) => item.product.toString() === deleteproduct);
        currentUser.cart.splice(itemIndex, 1);
        await currentUser.save();

        res.redirect("/mycart");
    } catch (error) {
        console.log(error);
    }
}


const getUserProfile = async (req, res) => {
    try {
        const user = await Users.findById(req.session.userId)
        const addresses = await address.find({ UserId: req.session.userId })
        // console.log(addresses);
        if (!user) {
            res.status(404).send("user not found")
        }
        res.render("userProfile", { user, addresses })
        // console.log(user);

    } catch (error) {
        console.log(error);

    }
}


const getEditProfile = async (req, res) => {
    try {
        const userId = req.query.userId;
        const currentUser = await Users.findById(userId)
        res.render('editPersonalInfo', { currentUser })
    } catch (error) {
        console.log(error);
    }
}


const EditProfile = async (req, res) => {
    try {
        console.log(req.body);
        const Updateinfo = await Users.updateOne({ _id: req.params.userId }, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
            }
        });

        res.redirect('/user-profile')
    } catch (error) {
        console.log(error);

    }
}


const getUserAddAddress = async (req, res) => {
    try {
        res.render('addAddress')
    } catch (error) {
        console.log(error);
    }
}



const UserAddAddress = async (req, res) => {
    try {

        const { housename, pincode, post, district } = req.body
        const newAddress = new address({
            UserId: req.session.userId,
            pincode,
            district,
            post,
            housename,
        })

        await newAddress.save()
        console.log(address);
        console.log(newAddress);
        res.redirect('/user-profile')
    } catch (error) {
        console.log(error.message);
    }
}



const getEditAddress = async (req, res) => {
    try {

        const Address = await address.findById(req.params.addressId)
        console.log(Address)
        res.render('EditAddress', { Address })
    } catch (error) {
        console.log(error);
    }
}



const EditAddress = async (req, res) => {

    try {
        console.log(req.body);
        const UpdateAddress = await address.updateOne({ _id: req.params.addressId }, {
            $set: {
                housename: req.body.housename,
                pincode: req.body.pincode,
                post: req.body.post,
                district: req.body.district
            }
        });

        console.log(UpdateAddress);
        res.redirect('/user-profile');
    } catch (error) {
        console.log(error);

    }
}


const DeleteAddress = async (req, res) => {
    try {
        const addressId = req.params.addressId
        const deleteAddress = await address.deleteOne({ _id: addressId })
        // console.log(deleteAddress)
        res.redirect('/user-profile');


    } catch (error) {
        console.log(error);

    }
}

const getChangePassword = async(req,res)=>{
    try {
        const UserId = req.session.userId
        console.log(UserId);
        const user = await Users.findById(UserId)
        console.log(user);
        res.render('changePassword',{user})
    } catch (error) {
        console.log(error);
    }
}

const changePassword  = async(req,res)=>{
    try {
        const userId = req.session.userId
        // console.log(userId);
        const user = await Users.findById(userId)
        // console.log(req.body);
        if(!user){
            return res.status(404).send("User not Found")
        }
        const{oldPassword,newPassword,confirmPassword} = req.body
        //password comparing
        const passwordMatch = await bcrypt.compare(oldPassword,user.password)

        if(!passwordMatch){
            return res.render("changePassword",{message:"Oldpassword is incorrect"})
        }
        // Check if the new password and confirmation match
        if(newPassword !== confirmPassword){
            return res.render("changePassword",{message:"New passwords do not match"})
        }

        const hashedPassword = await bcrypt.hash(newPassword,10)  // second parameter "10" determines how many round it done for securing password
        //upadating password
        user.password = hashedPassword
        await user.save()
        res.render("changePassword",{user,message:"Password changed successfully"})   

    } catch (error) {
        console.log(error);
    }
}



const getCheckout = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await Users.findOne({ _id: userId }).populate("cart.product").select(["cart", "totalCartAmount", "name"]);
        if (!user) {
            throw new Error("User not found");
        }
        const addresses = await address.find({ UserId: req.session.userId })
        if (!addresses) {
            throw new Error("Addresses not found");
        }
        res.render("checkOut", { response: user, addresses });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}


const getorders = async (req, res) => {
    try {
        const userId = req.session.userId
        console.log(userId);
        const orders = await Order.find({userId:userId}).populate([
            { path: 'userId' },
            { path: 'product.productId' },
        ]);
        console.log(orders);
        res.render('orders', { orders })
    } catch (error) {
        console.log(error);
    }
}

const successPage = async (req, res) => {
    try {
        res.render("successPage")
    } catch (error) {
        console.log(error);
    }
}


const placeOrder = async (req, res) => {
    try {
        const { addressradio, productId, productPrice, productTotalAmount, productQuantity, orderAmount, paymentradio } = req.body;
        console.log(
            addressradio,
            productId,
            productPrice,
            productTotalAmount,
            productQuantity,
            orderAmount,
            paymentradio, 'req.body'
        )
        const productIds = Array.isArray(productId) ? productId : [productId];  // Ensure productId is always an array
        if (paymentradio === "COD") {

            // Create an instance of the order using the schema
            const orderId = `orderId-${uuidv4()}`.substring(0, 40)
            let  formattedDate = moment().format('ddd MMM DD YYYY');
            const order = new Order({
                userId: req.session.userId,
                delilveryAddress: addressradio,
                orderId,
                date: new Date(),
                product: productIds.map((id, index) => ({
                    productId: id,
                    quantity: parseInt(productQuantity[index], 10),
                    price: parseInt(productPrice[index], 10),
                    totalProductAmount: parseInt(productTotalAmount[index], 10),
                    orderStatus: 'pending', //  set the initial status here
                })),
                total: parseInt(orderAmount, 10),
                paymentType: paymentradio,
            });
            const savedOrder = await order.save();
            if (savedOrder) {
                res.json({ success: true })
            }
        } else if (paymentradio === "Online") {
            // const orderId = `orderId-${uuidv4()}`.substring(0,40)
            const orderId = `orderId-${uuidv4()}`.substring(0, 40)
            req.session.orderId = orderId
            const options = {
                amount: orderAmount,  // amount in the smallest currency unit
                currency: "INR",
                receipt: orderId
            };
            instance.orders.create(options, async function (err, razorOrder) {
                console.log(razorOrder, "guftjyudraysdrdjuhfjuodrhu");
                if (err) {
                    console.log(err, 'order error from rezor pay');
                } else {
                    console.log(
                        addressradio,
                        productId,
                        productPrice,
                        productTotalAmount,
                        productQuantity,
                        orderAmount,
                        paymentradio,
                        "order insider razor payyyyyyyyyyyyyyy"
                    )

                    const order = new Order({
                        userId: req.session.userId,
                        delilveryAddress: addressradio,
                        orderId: orderId,
                        date: new Date(),
                        product: productIds.map((id, index) => ({
                            productId: id,
                            quantity: parseInt(productQuantity[index], 10),
                            price: parseInt(productPrice[index], 10),
                            totalProductAmount: parseInt(productTotalAmount[index], 10),
                            orderStatus: 'pending', //  set the initial status here
                        })),
                        total: parseInt(orderAmount, 10),
                        paymentType: paymentradio,
                    });
                    const savedOrder = await order.save()
                    if (savedOrder) {
                        console.log(savedOrder);
                        res.json({ success: false, order: razorOrder, orderId: savedOrder._id })
                    }

                }
            });

        }


    } catch (error) {
        console.log(error);
        // Handle the error, possibly by sending an error response to the client.
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getSuccesful = async (req, res) => {
    try {
        res.render('successPage')
    } catch (error) {
        console.log(error);
    }
}



const verifyPayment = async (req, res) => {
    try {
        console.log(req.body, "dbbbbbbbbbbdddddddddddyyyyyyyyyyyyyy");
        const { response, order, orderId } = req.body
        const sessionOrderId = req.session.orderId
        let hash = crypto.createHmac("sha256", "JdG2FakQQqlUlXItBLeDrxP2")
        hash.update(order.id + "|" + response.razorpay_payment_id, "JdG2FakQQqlUlXItBLeDrxP2")
        hash = hash.digest("hex")

        if (hash == response.razorpay_signature) {
            console.log("successssssss");

            await Order.findOne({ orderId: sessionOrderId })
                .then((response) => {
                    console.log(response);
                })

            const success = await Order.updateOne({ orderId: sessionOrderId }, { $set: { status: "ordered" } })
            if (success) {
                res.json({ success: true })
            } else {
                res.json({ success: false })
            }
        } else {
            console.log("faileddddd");
            const success = await Order.updateOne({ orderId: sessionOrderId }, { $set: { status: "Payment Failed" } })
            if (success) {
                res.json({ success: false })
            }
        }


    } catch (error) {
        console.log(error);
    }
}






module.exports = {
    getHome,
    getLogin,
    doLogin,
    getForgotPassword,
    forgotpasswordEmail,
    getResetPage,
    resetPassword,
    getSignup,
    doSignUp,
    doLogout,
    getOtppage,
    checkOtpValid,
    getAllshoes,
    getCart,
    updateQuantity,
    addToCart,
    removeFromCart,
    getUserProfile,
    getCheckout,
    getorders,
    placeOrder,
    verifyPayment,
    getSuccesful,
    getSingleProduct,
    getUserAddAddress,
    UserAddAddress,
    getEditProfile,
    getEditAddress,
    DeleteAddress,
    getChangePassword,
    changePassword,
    EditAddress,
    EditProfile,
    successPage

}