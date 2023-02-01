const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Address } = require("../../models")
exports.addMyAddress = catchAsync(async(req, res, next) => {
    req.body.userId = req.user.id
    let address = await Address.create(req.body)
    return res.status(201).send(address)
})
exports.getAllAddress = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20
    const offset = req.query.offset
    const address = await Address.findAll({ where: { userId: req.user.id }, limit, offset })
    return res.status(200).send({ address })
})
exports.editMyAddress = catchAsync(async(req, res, next) => {
    const address = await Address.findOne({ where: { address_id: req.params.id } })
    if (!address) return next(new AppError("Address not found with that id", 404))
    await address.update({ address: req.body.address, welayat: req.body.welayat })
    return res.status(200).send(address)
})
exports.deleteMyAddress = catchAsync(async(req, res, next) => {
    const address = await Address.findOne({ where: { address_id: req.params.id } })
    if (!address) return next(new AppError("Address not found with that id", 404))
    await address.destroy()
    return res.status(200).send({ msg: "Success" })
})
exports.getAddress = catchAsync(async(req, res, next) => {
    const address = await Address.findOne({ where: { address_id: req.params.id } })
    if (!address) return next(new AppError("Address not found with that id", 404))
    return res.status(200).send(address)
})