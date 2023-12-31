const multer = require('multer')
const path = require('path')
const storage = multer.diskStorage(
    {
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../Public/Images/product-images'))
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now()
            cb(null, `${uniqueSuffix}-${file.originalname}`)
        }
    }
)

const upload = multer({storage : storage})
module.exports = upload