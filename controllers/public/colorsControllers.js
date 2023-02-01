const { Colors } = require("../../models")
const catchAsync = require('../../utils/catchAsync');

exports.getAllColors = catchAsync(async(req, res, next) => {
    const colors = await Colors.findAll({
        order: [
            ["id", "DESC"]
        ]
    })
    return res.status(201).send(colors)
})