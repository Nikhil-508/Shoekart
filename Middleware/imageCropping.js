const sharp = require('sharp')
const multer = require('multer')
const path = require('path')
const {v4} = require('uuid')

const storage = multer.memoryStorage();

const filefilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(err,false)
    }
}

const upload = multer({storage, filefilter})

//products
exports.uploadProductImages = upload.fields([
    {
        name:'images',
        maxcount:3
    }
])

exports.resizeProductImages = async (req, res, next) => {
    try {
        console.log("haiiiiiiii");
        console.log(req.files);

        if (!req.files) return next();
        req.body.images = [];
        await Promise.all(

            req.files.map(async (file) => {
                const filename = `product-${v4()}.jpeg`;
                console.log(filename,"spaceeee",file.path);
                await sharp(file.path)
                    .resize(640,640)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(path.join(__dirname, '../Public/Images/product-images', filename));
                req.body.images.push(filename);
                console.log("successsssssss");
            })
            
            
        );
        next();
    } catch (error) {
        console.log(error);
    }
};

