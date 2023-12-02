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
        res.status(404).sendFile(path.join(__dirname,'public','404error.html'))
    }
}

const getEditCategory = async(req,res)=>{
    try {
        const categoryId = req.params.categoryId
        const categoryData = await Categories.findById(categoryId)
        res.render('editCategory',{categoryData})
    } catch (error) {
        console.log(error)
        res.status(404).sendFile(path.join(__dirname,'public','404error.html'))
    }
}

const editCategory = async(req,res)=>{
    try {
        const categoryId = req.body.categoryId
        const categoryName = req.body.name
        const description= req.body.description
        const categoryOffer = req.body.ctgrydiscountPercentage
        console.log(categoryId,"idddididid")
        console.log(categoryOffer,"offerrrrrr")

        await Categories.updateOne({_id:categoryId},{$set:{name:categoryName,description:description,categoryPercentageOffer:categoryOffer}})
        res.redirect('/admin/categories')

    } catch (error) {
        console.log(error)
        res.status(404).sendFile(path.join(__dirname,'public','404error.html'))
    }
}

module.exports = {getAddCategories,
                    addCategories,
                    getEditCategory,
                    editCategory    }