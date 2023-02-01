const { Colors } = require("../../models")
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
exports.addColor = catchAsync(async(req, res, next) => {
    const color = await Colors.create(req.body)
    return res.status(201).send(color)
})
exports.editColor = catchAsync(async(req, res, next) => {
    const color = await Colors.findOne({ where: { color_id: [req.params.id] } });

    if (!color)
        return next(new AppError('Brand did not found with that ID', 404));
    await color.update({ name_tm, name_ru });
    return res.status(200).send(color);
});