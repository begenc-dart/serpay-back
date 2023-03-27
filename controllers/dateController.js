 const { Products,Users } = require("../models")
const { Op } = require("sequelize")
const schedule = require("node-schedule")
const fs = require("fs")
const dates = schedule.scheduleJob('0 38 16 * * *', async function() {
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
const isParticipating = schedule.scheduleJob('0 0 0 * * 1', async function() {
    await Users.update({isParticipating:false},{where:{isParticipating:true}})
    console.log("users are not participating")
});
module.exports = () => { dates }