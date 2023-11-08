const express = require('express')
const adminRouter = express()
const auth = require('../Middleware/auth')


const admincontroller = require('../Controller/adminController')
const productController = require('../Controller/productController')
const categoryController = require('../Controller/categoryController')
const userController = require('../Controller/userController')
const upload = require('../Middleware/multer')

adminRouter.set('views','./View/Admin')

adminRouter.get('/login',admincontroller.getLogin)
adminRouter.post('/login',admincontroller.doLogin)
adminRouter.get('/', auth.adminAuth,  admincontroller.getDashboard)


adminRouter.get('/users',auth.adminAuth,admincontroller.getUsers)
adminRouter.get('/users/block-theUser',auth.adminAuth,admincontroller.blockTheUSer)
adminRouter.get('/users/unblock-theUser',auth.adminAuth,admincontroller.unblockTheUSer)

adminRouter.post('/logout', auth.adminAuth, admincontroller.adminLogout )


adminRouter.get('/products',auth.adminAuth,admincontroller.getProducts)
adminRouter.get('/add-products', auth.adminAuth, productController.getAddProducts)
adminRouter.post('/add-product', upload.array('img',4) ,auth.adminAuth, productController.addProduct)
adminRouter.get("/getProductEdit/:productId", auth.adminAuth,  productController.getProductEdit)
adminRouter.post('/editProduct',auth.adminAuth,productController.editProduct)
adminRouter.get("/products/Active/:id", auth.adminAuth,productController.productActivate)
adminRouter.get('/products/Deactive/:id',auth.adminAuth,productController.productDeactivate)


//get orders
adminRouter.get('orders',auth.adminAuth,admincontroller.getOrders)

adminRouter.get('/categories',auth.adminAuth,admincontroller.getCategories)
adminRouter.get('/add-categories',auth.adminAuth,categoryController.getAddCategories)
adminRouter.post('/add-categories',auth.adminAuth,categoryController.addCategories)

adminRouter.get('/orders',auth.adminAuth,admincontroller.getOrders)





module.exports = adminRouter
