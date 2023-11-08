const products = require('../Model/productSchema')
const Categories = require('../Model/catagorySchema')

const getAddProducts = async(req,res)=>{
    try {
            const categories = await Categories.find({})
            res.render('add-products' , {categories})
    } catch (error) {
        console.log(error);
    }
}

const addProduct = async(req,res)=>{
    try {
       
            const {name,category,quantity,price,gender,description,colour,size} = req.body
            
            const images = req.files.map((element)=>{
                return element.filename
            })
            const product = new products({
                name:name,
                category:category,
                quantity:quantity,
                price:price,
                gender:gender,
                description:description,
                colour:colour,
                size:size,
                images:images
            })
            const productData = await product.save()
            if(productData) {
                res.redirect('/admin/products')
            }           
        
    } catch (error) {
        console.log(error);
    }
}

const getProductEdit = async (req, res) => {
    try {
            const productId = req.params.productId;
            const productData = await products.findById(productId).populate("category")
            const categories = await Categories.find({});
            // console.log(productData);
            
            res.render('editproduct', { productData,categories });
        
    } catch (error) {
        console.log(error);
    }
};



const editProduct = async(req,res)=>{
    try {
      
            console.log(req.body);
            const productId= req.body.productId
            const productname= req.body.name
            const productcategory = req.body.category
            const productquantity = req.body.quantity
            const productprice = req.body.price
            const productgender = req.body.gender
            const productdescripton = req.body.description
            const productcolour = req.body.colour
            const productsize = req.body.size

             const isUpdate = await products.updateOne({_id:productId},{$set:{name:productname,category:productcategory,quantity:productquantity,price:productprice,gender:productgender,description:productdescripton,colour:productcolour,size:productsize}})
           console.log(isUpdate);
            res.redirect('/admin/products')
        
        
    } catch (error) {
        console.log(error);
        
    }
}

const productActivate = async(req,res)=>{
    try {
        const id = req.params.id
        const change = await products.updateOne({_id:id},{$set:{is_delete:false}})

        if(change){
           return res.redirect('/admin/products')
        }
    } catch (error) {
        console.log(error);
    }
}

const productDeactivate = async(req,res)=>{
    try {
        const id = req.params.id
        const change = await products.updateOne({_id:id},{$set:{is_delete:true}})
        console.log(change);
        if(change){
           return res.redirect('/admin/products')
        }
    } catch (error) {
        console.log(error);
    }
}





module.exports = {getAddProducts,
                   addProduct,
                getProductEdit,
                editProduct,
                productActivate,
                productDeactivate
            
            }