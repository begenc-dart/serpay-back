const { Users } = require("../../models")
const AppError = require("../../utils/appError")
const catchAsync = require("../../utils/catchAsync")


exports.getAllUsers = catchAsync(async(req, res, next) => {
    const { user_phone } = req.query
    let where = {}
    if (user_phone) where.user_phone = user_phone
    const users = await Users.findAll({
        where,
        attributes: ["user_phone", "username", "image"]
    })
    return res.status(200).send(users)
})