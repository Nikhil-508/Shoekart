const products = require('../Model/productSchema')
const Categories = require('../Model/catagorySchema')

const getAddProducts = async (req, res, next) => {
    try {
        const categories = await Categories.find({})
        res.render('add-products', { message:"", categories })
    } catch (error) {
        next(error)
        console.log(error);
    }
}


const  addProduct = async(req,res, next)=>{
    try {
            const {name,category,quantity,price,gender,description,colour,size} = req.body
            const imageArray = req.body.images 
          
            const product = new products({
                name:name,
                category:category,
                quantity:quantity,
                price:price,
                gender:gender,
                description:description,
                colour:colour,
                size:size,
                images:imageArray
            })

            const productData = await product.save()
            console.log("saveddddddddd")
            if(productData) {
                res.redirect('/admin/products')
            }           
        
    } catch (error) {
        next(error)
        console.log(error);
    }
}

const getProductEdit = async (req, res,next) => {
    try {
            const productId = req.params.productId;
            const productData = await products.findById(productId).populate("category")
            const categories = await Categories.find({});
            
            res.render('editproduct', {message:"", productData,categories });
        
    } catch (error) {
        next(error)
        console.log(error);
    }
};



const editProduct = async(req,res, next)=>{
    try {
      
            const productId= req.body.productId
            const productname= req.body.name
            const productcategory = req.body.category
            const productquantity = req.body.quantity
            const offer = req.body.discountPercentage
            const productprice = req.body.price
            const productgender = req.body.gender
            const productdescripton = req.body.description
            const productcolour = req.body.colour
            const productsize = req.body.size
            const Products = await products.findById(productId)
            const imageArray = req.body.images

            //image delete
            const index = req.body.index
            const upadateImages = Products.images.filter((image,i)=> i !== index)
        
            
            const isUpdate = await products.updateOne({_id:productId},{$set:{name:productname,category:productcategory,quantity:productquantity,offerpercentage:offer,price:productprice,gender:productgender,description:productdescripton,colour:productcolour,size:productsize}})
            const product = await products.findById(productId)
            if(imageArray.length > 1){
                for(let i = 0 ; i < imageArray.length ; i++){
                    product.images.push(imageArray[i])
                }
            }else{
                product.images.push(imageArray)
            }
           
            await product.save()
            console.log(isUpdate);


            res.redirect('/admin/products')
        
        
    } catch (error) {
        next(error)
        console.log(error);
        
        
    }
}

const deleteImage = async(req,res, next) => {
    try {
        const productId = req.params.productId; 
        const indexid = req.params.index;
        console.log(productId,"sspaceeee",indexid);
        
        const product = await products.findById(productId);

      const value =  product.images.splice(indexid,1)
      console.log(value);
        console.log("successs");
        await product.save()
        
        res.redirect(`/admin/getProductEdit/${productId}`);

    } catch (error) {
        next(error)
        console.log(error);
        
    }
}


const productActivate = async(req,res,next)=>{
    try {
        const id = req.params.id
        const change = await products.updateOne({_id:id},{$set:{is_delete:false}})

        if(change){
           return res.redirect('/admin/products')
        }
    } catch (error) {
        next(error)
        console.log(error);
        
    }
}

const productDeactivate = async(req,res, next)=>{
    try {
        const id = req.params.id
        const change = await products.updateOne({_id:id},{$set:{is_delete:true}})
        console.log(change);
        if(change){
           return res.redirect('/admin/products')
        }
    } catch (error) {
        next(error)
        console.log(error);
        
    }
}





module.exports = {getAddProducts,
                   addProduct,
                getProductEdit,
                editProduct,
                deleteImage,
                productActivate,
                productDeactivate
            
            }