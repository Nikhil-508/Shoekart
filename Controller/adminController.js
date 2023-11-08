// const Admin = require('../Model/adminSchema')

// const Users = require('../Model/userSchema')

const Products = require('../Model/productSchema')
const Categories = require('../Model/catagorySchema')
const Users = require('../Model/userSchema')
const Orders = require("../Model/orderSchema")


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
            res.redirect('/admin')

        } else {
            res.status(404).json({ error: "wrong credentials" })
        }

    } catch (error) {
        res.status(500)
    }

}

const getDashboard = async (req, res) => {
    try {
        res.render('admindashboard')
    } catch (error) {
        console.log(error);
    }
}

const getUsers = async (req, res) => {
    try {
      
            const users = await Users.find({})
            // console.log(users);
            res.render('users', { users })
        

    } catch (error) {
        console.log(error);
    }
}


const getProducts = async (req, res) => {
    try {
        const products = await Products.find({}).populate('category').exec()
        // console.log(products);
        // for(let i = 0; i < products.length; i ++) {
        //     const data = await Products.findById(products[i]._id).populate('category')
        //     productData.push(data)
        // }
        // console.log(productData);
        res.render('products', { products })
    }
    catch (error) {
        console.log(error)
    }
}



const getCategories = async (req, res) => {
    try {

        const categories = await Categories.find({})
        console.log(categories);
        res.render('catagories', { categories })

    } catch (error) {
        console.log(error);
    }
}

const getOrders = async (req, res) => {
    try {
        const orders = await Orders.find().populate([
            { path: 'userId' },
            { path: 'product.productId' },
        ]);
        
        console.log(orders); 
        console.log();

        res.render('orders', { orders });
    } catch (error) {
        console.log(error);
    }
};


const adminLogout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/admin/')
    } catch (error) {
        console.log(error);

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
    }
}



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
    adminLogout
}

