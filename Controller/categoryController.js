const Categories = require('../Model/catagorySchema')


const getAddCategories = async(req,res)=>{
    try {
      
            res.render('add-category')
        
    } catch (error) {
        console.log(error);
    }
}

const addCategories = async(req,res)=>{
    try {
       
            const {name,description} = req.body

            const isExist = await Categories.findOne({name:name})
            if(isExist){
                return res.render('add-category',{message:"category already exist"})
            }
            const categories = new Categories({
                name:name,
                description:description
            })
            
             const categoryData = await categories.save()
            //  console.log(categoryData);
             if(categoryData) {
                res.redirect('/admin/categories')
            }
        
    } catch (error) {
        console.log(error);
    }
}

module.exports = {getAddCategories,
                    addCategories    }