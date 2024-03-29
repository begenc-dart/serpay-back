 const { Products,Users,Freeproducts } = require("../models")
const { Op } = require("sequelize")
const schedule = require("node-schedule")
const fs = require("fs")
const dates = schedule.scheduleJob('0 0 * * * *', async function() {
    var expiration_days = fs.readFileSync('./config/expire_time.txt', 'utf8')
    let today = new Date().getTime()
    let expiration_time_ms = Number(expiration_days) * 86400 * 1000
    let expiration_time = today - expiration_time_ms
    let products = await Products.findAll({
        where: {
            is_new_expire: {
                [Op.lt]: expiration_time
            },
            isNew: true
        }
    })
    console.log(18,products)
    for (const product of products) {
        console.log(product)
        product.update({ isNew: false })
        console.log(`Product with id: ${product.product_id} is not new product now`)
    }
});
const isParticipating = schedule.scheduleJob('0 0 * * * *', async function() {
    const free_product=await Freeproducts.findOne({where:{isActive:true}})
    if(free_product){
        const expire_time=free_product.expire_date
        const now=new Date()
        console.log()
        const split=expire_time.split(" ")
        const expire_date=new Date(split[0]+"T"+split[1])
        if(expire_date.getDate()==now.getDate() && expire_date.getHours()==now.getHours()){
            console.log("true")
            await Freeproducts.update({isActive:false},{where:{isActive:true}})
            await Users.update({isParticipating:false},{where:{isParticipating:true}})

        }
    }
})
module.exports = () => { dates }
