// const Admin = require('../Model/adminSchema')
// const Users = require('../Model/userSchema')

const moment = require('moment')
const Admin = require('../Model/adminSchema')
const Products = require('../Model/productSchema')
const Categories = require('../Model/catagorySchema')
const Users = require('../Model/userSchema')
const Orders = require("../Model/orderSchema")
const Coupons = require('../Model/couponSchema')
const { response } = require('../Routs/userRoutes')


const admin = {
    email: "admin@gmail.com",
    password: "123"
}

const getLogin = async (req, res) => {
    try {
        if (!req.session.adminId) {
            res.render("adminlogin")
        } else {
            res.redirect("/admin")
        }
    } catch (error) {
        console.log(error);
    }
}

const doLogin = async (req, res) => {

    try {

        const adminemail = req.body.email
        const password = req.body.password

        if (adminemail == admin.email && password == admin.password) {
            req.session.adminId = admin.email
           return  res.redirect('/admin/admindashboard')

        } else {
            return res.render('adminlogin', { message: "Incorrect password" })
        }

    } catch (error) {
        res.status(500)
    }

}

const getDashboard = async (req, res) => {
    try {
        const pipeline = [
            {
                $match: {
                    status: 'Delivered'
                }
            },
            {
                $group: {
                    _id: null,
                    lifeTimeRevenue: { $sum: '$total'}
                }
            },
            {
                $project: {
                    _id:0,
                    lifeTimeRevenue: 1
                }
            }
        ];
        const PaymentOptionsPipeline = [
            {
                $match: {
                    status: 'Delivered'
                }
            },
            {
                $group: {
                    _id: 'paymentType',
                    count: {
                        $sum: 1
                    },
                    totalAmount: {
                        $sum: 'total'
                    }
                }
            }
        ]

        let outofstock = await Products.find({quantity:{ $lte:1}})

        const allMonths = await everyMonthIncome()
        const alltime = await Orders.aggregate(pipeline)
        const DailyI = await DailyIncome()
        const MonthlyI = await MonthlyIncome()
        const yearlyI = await YearlyIncome()
        const bestProducts = await findBestSellngProducts()
        //finding pending orders
        const PendingOrders = await Orders.find({ status: 'pending'}).populate('userId')
        console.log(PendingOrders)
        const paymentoptions = await Orders.aggregate(PaymentOptionsPipeline);
        //finding blocked users
        const blockUsers = await Users.find({is_block: true})
        const allUsers = await Users.find()

        res.render('admindashboard',{
            daily: DailyI,
            monthly: MonthlyI,
            yearly: yearlyI,
            lifeTime: alltime,
            orders: PendingOrders,
            BlockedUsers: blockUsers,
            paymentoptions,
            allMonths,
            bestProducts,
            allUsers,
            outofstock,
        })
    } catch (error) {
        console.log(error);
        res.status(404).sendFile(path.join(__dirname,'public','404error.html'))
    }
}

const getUsers = async (req, res) => {
    try {
            const users = await Users.find({})
            res.render('users', { users })

    } catch (error) {
        console.log(error);
        res.status(404).sendFile(path.join(__dirname,'public','404error.html'))
    }
}


const getProducts = async (req, res) => {
    try {
        const products = await Products.find({}).populate('category').exec()
        res.render('products', { products })
    }
    catch (error) {
        console.log(error)
    }
}


const getCategories = async (req, res) => {
    try {

        const categories = await Categories.find({})
        // console.log(categories);
        res.render('catagories', { categories })

    } catch (error) {
        console.log(error);
        res.status(404).sendFile(path.join(__dirname,'public','404error.html'))
    }
}

const getOrders = async (req, res, next) => {
    try {
        const orders = await Orders.find().populate([
            { path: 'userId' },
            { path: 'product.productId' },
        ]);
        
        res.render('orders', { orders });
    } catch (error) {
        next(error)
        console.log(error);
    }
};


const adminLogout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/admin/')
    } catch (error) {
        console.log(error);
        res.status(404).sendFile(path.join(__dirname,'public','404error.html'))

    }
}

const blockTheUSer = async(req,res)=>{
    try {
        const {id} =req.query
        const change = await Users.updateOne({_id:id},{$set:{is_block:true}})
        if(change){
            return res.redirect('/admin/users')
        }
    } catch (error) {
        console.log(error);
        res.status(404).sendFile(path.join(__dirname,'public','404error.html'))
    }
}

const unblockTheUSer = async(req,res)=>{
    try {
        const {id} = req.query
        const change = await Users.updateOne({_id:id},{$set:{is_block:false}})
        if(change){
            
            return res.redirect('/admin/users')
        }
    } catch (error) {
        console.log(error);
        res.status(404).sendFile(path.join(__dirname,'public','404error.html'))
    }
}




const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        // Validate the status to make sure it's a valid value
        const validStatusValues = ['Shipped', 'Delivered', 'Processing', 'Cancelled',"pending",'Return'];
        if (!validStatusValues.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status value' });
        }

        // Update the order status in the database
        const updatedOrder = await Orders.findByIdAndUpdate(orderId, { status }, { new: true });
        const user = await Users.findById(updatedOrder.userId);
        console.log(updatedOrder,"adminordrrrupdate");
        if(updatedOrder.status === "Cancelled"){

            user.wallet += updatedOrder.total;
            await user.save();

            const newTransaction = {
                amount: updatedOrder.total,
                type : "Credit", 
                date: new Date(),
              };
             

             

              await Users.findByIdAndUpdate(updatedOrder.userId, { $push: { walletTransactions: newTransaction } });
        }



        if (updatedOrder) {
            res.redirect('/admin/orders')
            // res.json({ success: true, updatedOrder });
        } else {
            res.render('orders',{message:'Order not found or status not updated'})
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};


const getViewCoupon = async(req,res)=>{
    try{
        const adminData = await Admin.findOne({})
        await Coupons.find()
        .then((response) =>{
            res.render('viewCoupon' , {couponData : response, moment: moment , adminData : adminData})
        })

    }catch(error){
        console.log(error);
        res.status(404).sendFile(path.join(__dirname,'public','404error.html'))
    }
}

const addCoupon = async (req , res, next) =>{

    try{
        const{couponCode , expiryDate , maxDiscount , minPurchaseAmount , percentageDiscount} = req.body
        const newCoupon = new Coupons({
            couponCode : couponCode,
            expiryDate : expiryDate,
            percentageDiscount : percentageDiscount,
            maxDiscount : maxDiscount,
            minPurchaseAmount : minPurchaseAmount,
            percentageDiscount : percentageDiscount
        })
        await newCoupon.save()
        .then((response) =>{
            return res.redirect('/admin/viewCoupon')
        })
    
        
        return res.json({response : `Added coupon : ${couponCode}`})
    }catch(error){
        next(error)
        console.log(error);
    }
}


const deleteCoupon = async (req , res , next) =>{

    try{
        const couponId = req.body.couponId
        await Coupons.findByIdAndDelete(couponId)
        .then((response) =>{
            res.json(response )
            // return res.redirect('/admin/viewCoupons');
        })
    }catch(error){
        console.log(error.message);
        res.status(404).sendFile(path.join(__dirname,'public','404error.html'))
    }
}

const getSalesReport = async(req,res)=>{
    try {
        let data = 0
        let deliveredOrders
        let canceledOrders
        let returnedOrder
        let totalRevenue
        let starting
        let ending
        res.render('salesReport',{ending,starting,totalRevenue,returnedOrder,canceledOrders,deliveredOrders,data})
    } catch (error) {
        console.log(error);
        res.status(404).sendFile(path.join(__dirname,'public','404error.html'))
    }
}

const calculateReport = async (req, res) => {
    try {
        const { starting, ending } = req.body;
        const startDate = new Date(starting);
        const endDate = new Date(ending);
        endDate.setDate(endDate.getDate() + 1);
        req.session.startDate = startDate;
        req.session.endDate = endDate;

        const desiredStatuses = ["Delivered", "Returned", "Cancelled","Return"];
     

        const deliveredOrders = await Orders.find({
            date: { $gte: startDate, $lte: endDate },
            status: { $in: desiredStatuses }
        })
        .populate('userId')
        .populate('product.productId')

        const returnedOrders = await Orders.find({
            date: { $gte: startDate, $lte: endDate },
            status: "Return"
        });

        const canceledOrders = await Orders.find({
            date: { $gte: startDate, $lte: endDate },
            status: "Cancelled"
        });

        const totalRevenue = await Orders.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate },
                    status: "Delivered"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total" }
                }
            }
        ]);

        let data = 1;
        console.log(totalRevenue,"rvrnnuuueee");
        res.render("salesReport",{deliveredOrders,canceledOrders,returnedOrders,totalRevenue,data,starting,ending})
        
    } catch (error) {
        console.log(error);
        res.status(404).sendFile(path.join(__dirname,'public','404error.html'))
    }
};






module.exports = {
    getLogin,
    doLogin,
    getDashboard,
    getUsers,
    blockTheUSer,
    unblockTheUSer,
    getProducts,
    getCategories,
    getOrders,
    adminLogout,
    updateOrderStatus,
    getViewCoupon,
    addCoupon,
    deleteCoupon,
    getSalesReport,
    calculateReport
}

