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
const mongoose = require('mongoose');
const categories = require('../Model/catagorySchema')
const Coupons = require('../Model/couponSchema');
const path = require('path');

//Razorpay instance

var instance = new Razorpay({
    key_id: 'rzp_test_fQpf1jt8afOnex',
    key_secret: 'JdG2FakQQqlUlXItBLeDrxP2',
});







function validateUserInput(name, email, phone, password) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!name || !email || !phone || !password) {
        return 'All fields are required';
    }

    if (!emailRegex.test(email)) {
        return 'Invalid email address';
    }

    if (!phoneRegex.test(phone)) {
        return 'Invalid phone number';
    }

    if (!passwordRegex.test(password)) {
        return 'Invalid password';
    }

    return null; // No validation errors
}




const getHome = async (req, res, next) => {
    try {
        const catData = await categories.find()
        const proData = await Products.find().populate('category')

        
        res.render('home', { catData, proData })

    } catch (error) {
        next(error)
        console.log(error.message);
    }
}

const getLogin = async (req, res, next) => {
    try {
        res.render('login')

    } catch (error) {
        next(error)
        console.log(error.message);
    }
}

const doLogin = async (req, res, next) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const usermatch = await Users.findOne({ email: email })
        if (!usermatch) {
            return res.render('login', { message: "User not found" })
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
        next(error)
        console.log(error);
    }
}


const getForgotPassword = async (req, res, next) => {
    try {
        res.render("forgotPassword")
    } catch (error) {
        next(error)
        console.log(error);
    }
}

const forgotpasswordEmail = async (req, res, next) => {
    try {
        const Email = req.body.email
        const user = await Users.findOne({ email: Email })
        console.log(user)
        console.log(Email);
        if (!user) {
            res.render("forgotPassword", { message: "User not registered" })
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
        next(error)
        console.log(error);
    }
}


const getResetPage = async (req, res, next) => {
    try {
        const resetToken = req.params.token
        res.render("resetPassword", { resetToken })
    } catch (error) {
        next(error)
        console.log(error);

    }
}


const resetPassword = async (req, res, next) => {
    try {
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        const resetToken = req.body.token;
        console.log(newPassword, "neww", confirmPassword);

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
        res.render('resetPassword', { message: 'Password reset successful', resetToken: resetToken });


    } catch (error) {
        next(error)
        console.log(error);
    }
}

const getSignup = async (req, res, next) => {
    try {
        res.render('signup')
    } catch (error) {
        next(error)
        console.log(error.message);

    }
}

const doSignUp = async (req, res, next) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const password = req.body.password;
        const newPassword = req.body.confirmpassword;
        const referralCode = req.body.referralCode 

        const validationError = validateUserInput(name, email, phone, password);
        console.log(validationError, "errorrr");
        if (validationError) {
            return res.render('signup', { message: validationError });
        }

        // Confirm password
        if (password !== newPassword) {
            return res.render('signup', { message: "Password does not match" });
        }

        // Check if the user already exists
        const userMatch = await Users.findOne({ email: email });
        if (userMatch) {
            return res.render('signup', { message: "User Already Exists" });
        }
          

        // If user does not exist, proceed to save the user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);
        const user = {
            name: name,
            password: hashedPassword,
            email: email,
            phone: phone
        };

        const code = referralCode.trim()
        const referredUser = await Users.findOne({referralCode: code})
        if(referredUser){
            const currentDate = Date.now() //this is to get the current timestamp
            const newTransaction = {
                amount: 100,
                type: "Refferal Credit",
                date: currentDate,
            };
            await Users.findByIdAndUpdate(
                referredUser._id,
                {
                    $inc:{wallet:100},
                    $push:{
                        walletTransactions:newTransaction
                    }
                }
            )
            //updating the new users wallet
            user.wallet = 20
            user.referred = true
            user.walletTransactions = user.walletTransactions || [];
            const newUserTransaction = {
                amount: 20,
                type: "Referral Credit",
                date: currentDate,
            };
            user.walletTransactions.push(newUserTransaction)
            }

        const userData = new Users(user);
        await userData.save();

        // send the verification email
        sendOtpVerificationEmail(userData, res);
        res.redirect(`/otp-verification?userId=${userData._id}`);
    } catch (error) {
        next(error);
        console.log(error);
    }
};



const doLogout = (req, res, next) => {
    try {
        if (req.session.userId) {
            req.session.destroy();
            return res.redirect("/login")
        } else {
            return res.redirect('/')
        }

    } catch (error) {
        next(error)
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
                    <p>This code <b> expires in 15 minutes</b>.</p>`
        }
        // Hash the OTP
        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        const newOTPVerification = new userOtpVerification({
            userID: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expireAt: Date.now() + 900000,
        });

        //save the otp

        await userOtpVerification.deleteMany({ userId: _id })
        await newOTPVerification.save()
        //send email
        await transporter.sendMail(mailOption);
    } catch (error) {
        console.log(error)


    }
}



//....Getting OTP page....

const getOtppage = async (req, res, next) => {
    try {
        const userId = req.query.userId; // Use req.query to retrieve query parameters
        console.log(userId);
        res.render('otpPage', { userId });
    } catch (error) {
        next(error)
        console.log(error);

    }
}

// OTP valid checking

const checkOtpValid = async (req, res, next) => {
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

        await Users.updateOne({ _id: ID }, { $set: { is_verified: true } });
        await userOtpVerification.deleteOne({ userID: ID });
        console.log("completed");
        return res.redirect('/login')

    } catch (error) {
        next(error)
        console.log(error);



    }
}



const getAllShoes = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const productsPerPage = 3;
        const categoryId = req.query.category;
        const gender = req.query.gender;

        console.log(req.query);

        let query = {};

        if (categoryId) {
            // If category filter is provided, add it to the query
            query = { 'category': categoryId };
        }

        const catData = await categories.find()

        // Calculate the starting index based on the page number
        const startIndex = (page - 1) * productsPerPage;

        // Fetch products from the database based on the calculated startIndex and filters
        const products = await Products.find(query)
            .skip(startIndex)
            .limit(productsPerPage);

        const filteredProducts = products.filter(product => !product.is_delete);

        console.log(filteredProducts);

        //  totalProducts count
        const totalProducts = await Products.countDocuments(query);

        const populatedProducts = await Products.populate(products, { path: 'category' });

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalProducts / productsPerPage);

        // Fetch the category names for rendering in the UI
        const category = await categories.find();
        console.log(filteredProducts);
        res.render("allShoes", { filteredProducts, products, currentPage: page, populatedProducts, catData, totalPages, categoryId, gender, category });

    } catch (error) {
        next(error)
        console.log(error.message);

    }
};



const getproductsByCategory = async (req, res, next) => {
    try {


        const catId = req.query.catId
        const gender = req.query?.gender
        const page = parseInt(req.query.page) || 1;
        const pageSize = 2; //products per page


        const catData = await categories.find()
        let products

        if (gender) {
            products = await Products.find({ category: catId, gender: gender })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .populate('category')
        } else {
            products = await Products.find({ category: catId })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .populate('category')
        }

        const totalProducts = await Products.countDocuments({ category: catId, gender: gender })
        const totalPages = Math.ceil(totalProducts / pageSize)


        res.render("allShoes", { products, catData, catId, gender, currentPage: page, totalPages })
    } catch (error) {
        next(error)
        console.log(error);
    }
}



const getSingleProduct = async (req, res, next) => {
    try {
        const catData = await categories.find()
        const productId = req.params.productId
        const productData = await Products.find({ _id: productId });
        // console.log(productData);
        res.render('singleProduct', { productData, catData })
    } catch (error) {
        next(error)
        console.log(error);
    }
}



const getCart = async (req, res, next) => {
    try {
        const userId = req.session.userId
        const product = await Products.find()
        const catData = await categories.find()
        // const response = await Users.findOne({ _id: userId }).populate("cart.product").select(["cart", "totalCartAmount", "name"])
        const response = await Users.findOne({ _id: userId })
            .populate({
                path: 'cart.product',
                model: 'products',
                populate: {
                    path: 'category',
                    model: 'categories'
                }
            })
            .select(['cart', 'totalCartAmount', 'name']);

        
        res.render('myCart', { response, catData, product })

    } catch (error) {
        next(error)
        console.log(error);

    }
}


const updateQuantity = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        const productId = req.body.productId;
        const newQuantity = req.body.quantity;

        const productData = await Products.findOne({ _id: productId })


        const product = await Products.findById(productId).populate('category')
        const userData = await Users.findById( userId )
        let totalCartAmount = userData.totalCartAmount
        const newProductAmount = product.price * newQuantity
        let totalProductDiscount = 0
        if (product.offerpercentage) {
            totalProductDiscount += Math.floor((newProductAmount * product.offerpercentage / 100))
        }
        if (product.category.categoryPercentageOffer) {
            totalProductDiscount += Math.floor((newProductAmount * product.category.categoryPercentageOffer / 100))
        }
        // Update the quantity and productamount in the user's cart
        const user = await Users.findOneAndUpdate(
            { _id: userId, "cart.product": productId },
            {
                $set: {
                    "cart.$.quantity": newQuantity,
                    "cart.$.productAmount": newProductAmount,
                    // totalCartAmount: totalCartAmount + productData.price
                },
            },
            { new: true }
        );

        // // Update the totalCartAmount in the user's schema
        user.totalCartAmount = user.cart.reduce((total, item) => total + item.productAmount, 0);
        await user.save();

        res.json({ message: "hai heloss", newProductAmount, totalProductDiscount,totalCartAmount: user.totalCartAmount, productId })
    } catch (error) {
        next(error)
        console.log(error);
    }
};




const addToCart = async (req, res, next) => {
    try {
        const userId = req.session.userId
        const productId = req.params.productId
        const productData = await Products.findOne({ _id: productId })
        console.log(productData);
        console.log(productId, userId);
        const userData = await Users.findById( userId )
        let totalCartAmount = userData.totalCartAmount
        const response = await Users.updateOne(
            { _id: userId },
            {
                $push: {
                    cart: { product: productId, productAmount: productData.price },
                },
                $set: {
                    totalCartAmount: totalCartAmount + productData.price ,
                },
            }
        );
        res.redirect('/mycart')
    } catch (error) {
        next(error)
        console.log(error);
    }
}


const removeFromCart = async (req, res, next) => {
    try {
        const deleteproduct = req.params.proId
        const currentUser = await Users.findById(req.session.userId);

        const itemIndex = currentUser.cart.findIndex((item) => item.product.toString() === deleteproduct);
        if(itemIndex !== -1){
            const removedProductAmount = currentUser.cart[itemIndex].productAmount
            currentUser.cart.splice(itemIndex, 1);
            currentUser.totalCartAmount -= removedProductAmount
            await currentUser.save();
        }

        res.redirect("/mycart");
    } catch (error) {
        next(error)
        console.log(error);
    }
}


const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.session.userId
        const user = await Users.findById(userId)
        const catData = await categories.find()
        const addresses = await address.find({ UserId: req.session.userId })

        //wallet transaction
        const walletHistory = await getUserWalletHistory(userId)


        if (!user) {
            res.status(404).send("user not found")
        }
        res.render("userProfile", { user, addresses, catData, walletHistory })
    } catch (error) {
        next(error)
        console.log(error);

    }
}


//wallet history gettng function

const getUserWalletHistory = async (userId) => {
    try {
        const user = await Users.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const walletHistory = user.walletTransactions;
        return walletHistory;
    } catch (error) {
        console.log(error)
    }
};



const getEditProfile = async (req, res, next) => {
    try {
        const catData = await categories.find()
        const userId = req.query.userId;
        const currentUser = await Users.findById(userId)
        res.render('editPersonalInfo', { currentUser, catData })
    } catch (error) {
        next(error)
        console.log(error);
    }
}


const EditProfile = async (req, res, next) => {
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
        next(error)
        console.log(error);

    }
}


const getUserAddAddress = async (req, res, next) => {
    try {
        const catData = await categories.find()
        res.render('addAddress', { catData })
    } catch (error) {
        next(error)
        console.log(error);
    }
}



const UserAddAddress = async (req, res, next) => {
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
        next(error)
        console.log(error.message);
    }
}



const getEditAddress = async (req, res, next) => {
    try {
        const catData = await categories.find()
        const Address = await address.findById(req.params.addressId)
        console.log(Address)
        res.render('EditAddress', { Address, catData })
    } catch (error) {
        next(error)
        console.log(error);
    }
}



const EditAddress = async (req, res, next) => {

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
        next(error)
        console.log(error);

    }
}


const DeleteAddress = async (req, res, next) => {
    try {
        const addressId = req.params.addressId
        const deleteAddress = await address.deleteOne({ _id: addressId })
        res.redirect('/user-profile');

    } catch (error) {
        next(error)
        console.log(error);
    }
}

const getChangePassword = async (req, res, next) => {
    try {
        const UserId = req.session.userId
        const user = await Users.findById(UserId)
        res.render('changePassword', { user })
    } catch (error) {
        next(error)
        console.log(error);
    }
}

const changePassword = async (req, res, next) => {
    try {
        const userId = req.session.userId
        const user = await Users.findById(userId)
        if (!user) {
            return res.status(404).send("User not Found")
        }
        const { oldPassword, newPassword, confirmPassword } = req.body
        //password comparing
        const passwordMatch = await bcrypt.compare(oldPassword, user.password)

        if (!passwordMatch) {
            return res.render("changePassword", { message: "Oldpassword is incorrect" })
        }
        // Check if the new password and confirmation match
        if (newPassword !== confirmPassword) {
            return res.render("changePassword", { message: "New passwords do not match" })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)  // second parameter "10" determines how many round it done for securing password
        //upadating password
        user.password = hashedPassword
        await user.save()
        res.render("changePassword", { user, message: "Password changed successfully" })

    } catch (error) {
        next(error)
        console.log(error);
    }
}



const getCheckout = async (req, res, next) => {
    try {
       
        const userId = req.session.userId;
        const catData = await categories.find()
        const product = await Products.find()
        const coupon = await Coupons.find()

        const user = await Users.findOne({ _id: userId }).populate({
            path: 'cart.product',
            model: 'products',
            populate: {
                path: 'category',
                model: 'categories'
            }
        }).select(["cart", "totalCartAmount", "name", "wallet"]);
        if (!user) {
            throw new Error("User not found");
        }
        const addresses = await address.find({ UserId: req.session.userId })
        if (!addresses) {
            throw new Error("Addresses not found");
        }
        res.render("checkOut", { response: user, addresses, catData, product, finalPrice: '00',coupon });
    } catch (error) {
        next(error)
        console.error(error);
    }
}


const getorders = async (req, res, next) => {
    try {
        const userId = req.session.userId
        const page = parseInt(req.query.page) || 1
        const perPage = 5
        const totalOrders = await Order.find({userId:userId}).populate([
            {path:'userId'}
        ]).countDocuments()
        const totalPages = Math.ceil(totalOrders/perPage)

        const catData = await categories.find()
        const orders = await Order.find({ userId: userId }).sort({_id:-1}).populate([
            { path: 'userId' },
            { path: 'product.productId' },
        ]).skip((page-1)*perPage).limit(perPage)

        res.render('orders', { orders, catData,currentPage:page,totalPages,perPage })
    } catch (error) {
        next(error)
        console.log(error)
    }
}


const userupdateOrderStatus = async (req, res, next) => {
    try {
        const { orderId, status } = req.body;
        const userid = req.session.userId
        const user = await Users.findById(userid)


        // Validate the status to make sure it's a valid value
        const validStatusValues = ['Shipped', 'Delivered', 'Processing', 'Cancelled', 'Return'];
        if (!validStatusValues.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status value' });
        }

        // Update the order status in the database
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        

        if (updatedOrder.status === "Return") {
            user.wallet += updatedOrder.total;
            await user.save()

            const newTransaction = {
                amount: updatedOrder.total,
                type: "Credit",
                date: new Date(),
            };
            
            await Users.findByIdAndUpdate(updatedOrder.userId, { $push: { walletTransactions: newTransaction } });
        }


        if (updatedOrder) {
            res.redirect('/orders')
        } else {
            res.render('orders', { message: 'Order not found or status not updated' })
        }
    } catch (error) {
        next(error)
        console.error(error);
    }
}

const successPage = async (req, res) => {
    try {
        const catData = await categories.find()
        res.render("successPage",catData)
    } catch (error) {
        console.log(error);
    }
}


const placeOrder = async (req, res, next) => {
    try {
        const { addressradio, productId, productPrice, productTotalAmount, productQuantity, orderAmount, paymentradio,finalAmount } = req.body;
        const catData = await categories.find()

        if (!paymentradio) {
            return res.render('checkOut', { message: "Select your payment Type" })
        }

        if (!addressradio) {
            return res.render('checkOut', { message: "Select Your Address" })
        }

        const productIds = Array.isArray(productId) ? productId : [productId];  // Ensure productId is always an array

        if (paymentradio === "Wallet") {                   //>>>>>>>> Wallet <<<<<<<<<<<
            // console.log("startttttttt") 
            const orderId = `orderId-${uuidv4()}`.substring(0, 40)
            let formattedDate = moment().format('ddd MMM DD YYYY')
        
            const User = await Users.findById(req.session.userId)
        
            let savedOrder; 
        
            if (User.wallet >= orderAmount[0]) {
                User.wallet -= orderAmount[0]
                const transaction = {
                    type: "Debit",
                    amount: orderAmount[0],
                    date: new Date()
                }
                User.walletTransactions.push(transaction)
                
        
                await User.save();
        
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
                        orderStatus: "pending"
                    })),
                    total: parseInt(orderAmount[0], 10),
                    paymentType: paymentradio,
                });
        
                savedOrder = await order.save();
            } else {
                res.json({ success: false, message: "Insufficient balance in your wallet" })
            }
        
            if (savedOrder) {
                res.json({ success: true });
            }
        }
                 else if (paymentradio === "COD") {                  //>>>>>>>> C O D <<<<<<<<<<<
            // Create an instance of the order using the schema
            const orderId = `orderId-${uuidv4()}`.substring(0, 40)
            let formattedDate = moment().format('ddd MMM DD YYYY');
            const order = new Order({
                userId: req.session.userId,
                delilveryAddress: addressradio,
                orderId,
                date: new Date(),
                product: productIds.map((id, index) => ({
                    productId: id,
                    quantity: parseInt(productQuantity[index], 10),
                    price: parseInt(productPrice[index]),
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
            console.log("onlinneeeeeeee")              //>>>>>>>> Online <<<<<<<<<<<
            // const orderId = `orderId-${uuidv4()}`.substring(0,40)
            const orderId = `orderId-${uuidv4()}`.substring(0, 40)
            req.session.orderId = orderId
            const options = {
                amount: orderAmount[0],  // amount in the smallest currency unit
                currency: "INR",
                receipt: orderId
            };
            instance.orders.create(options, async function (err, razorOrder) {
                console.log(razorOrder, "guftjyudraysdrdjuhfjuodrhu");
                if (err) {
                    console.log(err, 'order error from rezor pay');
                } else {
                    

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
                        total: parseInt(orderAmount[0], 10),
                        paymentType: paymentradio,
                    });
                   
                    const savedOrder = await order.save()
                    if (savedOrder) {
                        // console.log(savedOrder);
                        res.json({ success: false, order: razorOrder, orderId: savedOrder._id })
                    }

                }
            });

        }


    } catch (error) {
        next(error)
        console.log(error);
        
    }
};


const redeemCoupon = async (req, res, next) => {
    try {
        
            const userid = req.session.userId
            const catData = await categories.find()
            const couponCode = req.body.couponCode
            const userData = await Users.findOne({ _id: userid })
            const coupon = await Coupons.findOne({ couponCode: couponCode })

            //>>>>>>>>>>>>> coupon checking <<<<<<<<<<

            const totalCartAmount = userData.totalCartAmount
            const currentDate = new Date()
            if (!coupon) {
                return res.json({ error: "No coupon exists!!!" })
            } else {
                const expiryDate = coupon.expiryDate
                const minPurchaseAmount = coupon.minPurchaseAmount
                const maxDiscountPercentage = coupon.percentageDiscount / 100
                const maxDiscountAmount = coupon.maxDiscount
                const isClaimed = await Coupons.findOne({ couponCode: couponCode, ClaimedUsers: { $elemMatch: { userId: userid } } })
                console.log(isClaimed,"couponnnclaimmmm")
                if (isClaimed) {
                    return res.json({ claimed: "Already claimed" })
                } else {
                    if (currentDate <= expiryDate) {
                        if (totalCartAmount >= minPurchaseAmount) {

                            const availableDiscountAmount = totalCartAmount * maxDiscountPercentage
                            let discountGained
                            if (availableDiscountAmount >= maxDiscountAmount) {
                                discountGained = maxDiscountAmount
                            } else {
                                discountGained = availableDiscountAmount
                            }
                            const oldCartAmount = totalCartAmount
                            const newTotalCartAmount = totalCartAmount - discountGained

                            const discountAmount = oldCartAmount - newTotalCartAmount
                            return res.json({ message: "Coupon Applied", oldCartAmount: oldCartAmount, newTotalCartAmount: newTotalCartAmount, couponCode: couponCode, discountAmount: discountAmount,catData })
                        } else {
                            return res.json({ minimumAmount: `Minimum purchase amount is Rs.${minPurchaseAmount}` })
                        }
                    } else {
                        return res.json({ couponExpired: "The coupon has expired !!!" })
                    }
                }

            }
       
    } catch (error) {
        next(error)
        console.log(error)
    }
}


const getSuccesful = async (req, res, next) => {
    try {
        const catData = await categories.find()
        res.render('successPage',catData)
    } catch (error) {
        next(error)
        console.log(error);
    }
}



const verifyPayment = async (req, res, next) => {
    try {
        const { response, order, orderId } = req.body
        const sessionOrderId = req.session.orderId
        let hash = crypto.createHmac("sha256", "JdG2FakQQqlUlXItBLeDrxP2")
        hash.update(order.id + "|" + response.razorpay_payment_id, "JdG2FakQQqlUlXItBLeDrxP2")
        hash = hash.digest("hex")

        if (hash == response.razorpay_signature) {

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
            const success = await Order.updateOne({ orderId: sessionOrderId }, { $set: { status: "Payment Failed" } })
            if (success) {
                res.json({ success: false })
            }
        }


    } catch (error) {
        next(error)
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
    getAllShoes,
    getproductsByCategory,
    getCart,
    updateQuantity,
    addToCart,
    removeFromCart,
    getUserProfile,
    getCheckout,
    getorders,
    userupdateOrderStatus,
    placeOrder,
    redeemCoupon,
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