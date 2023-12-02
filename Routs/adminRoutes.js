const express = require('express')
const moment = require('moment')
const adminRouter = express()
const auth = require('../Middleware/auth')
const imageCropping = require('../Middleware/imageCropping')


const admincontroller = require('../Controller/adminController')
const productController = require('../Controller/productController')
const categoryController = require('../Controller/categoryController')
const userController = require('../Controller/userController')
const upload = require('../Middleware/multer')
const { loadDash } = require('../Controller/dashboardController')

adminRouter.set('views','./View/Admin')
//Admin login
adminRouter.get('/login',admincontroller.getLogin)
adminRouter.post('/login',admincontroller.doLogin)
adminRouter.get('/', auth.adminAuth,  admincontroller.getDashboard)
adminRouter.get('/admindashboard',auth.adminAuth,loadDash)

//User management
adminRouter.get('/users',auth.adminAuth,admincontroller.getUsers)
adminRouter.get('/users/block-theUser',auth.adminAuth,admincontroller.blockTheUSer)
adminRouter.get('/users/unblock-theUser',auth.adminAuth,admincontroller.unblockTheUSer)

adminRouter.post('/logout', auth.adminAuth, admincontroller.adminLogout )

//product management
adminRouter.get('/products',auth.adminAuth,admincontroller.getProducts)
adminRouter.get('/add-products', auth.adminAuth, productController.getAddProducts)
adminRouter.post('/add-product',upload.array('img',4),imageCropping.resizeProductImages , productController.addProduct)
adminRouter.get("/getProductEdit/:productId", auth.adminAuth,  productController.getProductEdit)
adminRouter.post('/editProduct',upload.array('img',4),imageCropping.resizeProductImages,productController.editProduct)
adminRouter.get("/products/Active/:id", auth.adminAuth,productController.productActivate)
adminRouter.get('/products/Deactive/:id',auth.adminAuth,productController.productDeactivate)
adminRouter.get('/productImageDelete/:productId/:index',auth.adminAuth, productController.deleteImage);


//Sales Report
adminRouter.get('/getSalesReport',auth.adminAuth,admincontroller.getSalesReport)
adminRouter.post('/Report-managment',auth.adminAuth,admincontroller.calculateReport)

//category managment
adminRouter.get('/categories',auth.adminAuth,admincontroller.getCategories)
adminRouter.get('/add-categories',auth.adminAuth,categoryController.getAddCategories)
adminRouter.post('/add-categories',auth.adminAuth,categoryController.addCategories)
adminRouter.get('/getCategoryEdit/:categoryId',auth.adminAuth,categoryController.getEditCategory)
adminRouter.post('/CategoryEdit',auth.adminAuth,categoryController.editCategory)
//order management
adminRouter.get('/orders',auth.adminAuth,admincontroller.getOrders)
//manage status of the order
adminRouter.post('/updateOrderStatus',auth.adminAuth,admincontroller.updateOrderStatus)


//coupon managment
adminRouter.get('/viewCoupon',auth.adminAuth,admincontroller.getViewCoupon)
adminRouter.post('/addCoupon',auth.adminAuth,admincontroller.addCoupon)
adminRouter.post('/deleteCoupon',auth.adminAuth,admincontroller.deleteCoupon)




module.exports = adminRouter
