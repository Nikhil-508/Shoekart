const Products = require('../Model/productSchema')
const Orders = require('../Model/orderSchema')
const Users = require('../Model/userSchema')




//Daily income Calculation

const DailyIncome  = async(req,res)=>{

    try {
        const currentDate = new Date()
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1; //Months are 0 indexed
        const day = currentDate.getDate()

        // Create a formatted date string in "YYYY-MM-DD" format
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        const startDate = new Date(`${formattedDate}T00:00:00.000+00:00`);
        const endOfDay = new Date(`${formattedDate}T23:59:59.999+00:00`);

        const pipeline = [
            {
                $match:{
                    date:{
                        $gte: startDate,
                        $lte:endOfDay
                    },
                    status:'Delivered'
                }
            },
            {
                $group:{
                    _id:null,
                    dailyRevenue:{ $sum: '$total'}
                }
            },
            {
                $project:{
                    _id:0,
                    dailyRevenue:1
                }
            }
        ];

        let Result = await Orders.aggregate(pipeline);

        return Result;


    } catch (error) {
        console.log(error);
    }
};

//Monthly income Calculation
const MonthlyIncome = async (req, res) => {
    try {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        const formattedDate = `${year}-${month.toString().padStart(2, '0')}`;

        // Adjust for the time zone and include milliseconds
        const startDate = new Date(`${formattedDate}-01T00:00:00.000Z`);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        const pipeline = [
            {
                $match: {
                    date: {
                        $gte: startDate,
                        $lte: endOfMonth
                    },
                    status: 'Delivered'
                }
            },
            {
                $group: {
                    _id: null,
                    monthlyRevenue: { $sum: '$total' }
                }
            }
        ];

        const Result = await Orders.aggregate(pipeline);
        return Result;
    } catch (error) {
        console.log(error);
    }
};


const yearlyIncome = async(req,res)=>{
    try {
        const currentDate = new Date()
        const year = currentDate.getFullYear()

        const startDate = new Date(`${year}-01-01T00:00:00`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999`);

        const pipeline = [
            {
                $match: {
                    date: {
                        $gte: startDate,
                        $lte: endOfYear
                    },
                    status: 'Delivered'
                }
            },
            {
                $group: {
                    _id: null,
                    yearlyIncome: { $sum: '$total' }
                }
            },
            {
                $project: {
                    _id: 0,
                    yearlyIncome: 1
                }
            }
        ];


        const result = await Orders.aggregate(pipeline);
        
        return result
    } catch (error) {
        console.log(error);
    }

}

//everymonth calculation

const everyMonthIncome = async(req,res)=>{
    try {
        const currentDate = new Date()
        const year = currentDate.getFullYear()

        const startDate = new Date(`${year}-01-01T00:00:00`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999`);

        const pipeline = [
            {
                $match: {
                    date: {
                        $gte: startDate,
                        $lte: endOfYear
                    },
                    status: 'Delivered'
                }
            },
            {
                $group: {
                    _id: { $month: '$date' },
                    monthlyIncome: { $sum: '$total' }
                }
            },
            {
                $project: {
                    _id: 1,
                    month: '$_id',
                    monthlyIncome: 1
                }
            }
        ];
      

        const result = await Orders.aggregate(pipeline);
       
        return result

    } catch (error) {
        console.log(error);
    }
}

const findBestSellngProducts = async (req, res) => {
    try {
        const pipeline = [
            {
                $match: {
                    status: 'pending',
                    'product.productId': { $exists: true }
                }
            },
            {
                $unwind: '$product'
            },
            {
                $group: {
                    _id: '$product.productId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $project: {
                    _id: 1,
                    name: '$product.name',
                    count: 1
                }
            }
        ];

        const result = await Orders.aggregate(pipeline);
        return result;
    } catch (error) {
        console.log(error);
    }
};


const loadDash = async(req,res)=>{
    try {
        const pipeline = [
            {
                $match:{
                    status: 'Delivered'
                }
            },
            {
                $group:{
                    _id:null,
                    lifeTimeRevenue:{ $sum : '$total'}
                }
            },
            {
                $project:{
                    _id:0,
                    lifeTimeRevenue:1
                }
            }
        ]
        const PaymentOptionsPipeline = [
            {
                $match:{
                    status: 'Delivered'
                }
            },
            {
                $group: {
                    _id:'$paymentType',
                    count:{
                        $sum:1
                    },
                    totalAmount:{
                        $sum:'$total'
                    }
                }
            }
        ]

        let outofstock = await Products.find({quantity:{$lte:1}})

        const allMonths = await everyMonthIncome()
        const alltime = await Orders.aggregate(pipeline)
        const DailyI = await DailyIncome()
        const Monthly = await MonthlyIncome()
        const yearly = await yearlyIncome()
        const bestProducts = await findBestSellngProducts()

        const PendingOrders = await Orders.find({status:'pending'}).populate('userId')
        const paymentoptions = await Orders.aggregate(PaymentOptionsPipeline)

        const blockUsers = await Users.find({ is_block:true })
        const allUsers = await Users.find()
        
        res.render("admindashboard", {
            daily: DailyI,
            monthly: Monthly,
            yearly: yearly,
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
    }
}

module.exports = {loadDash}









