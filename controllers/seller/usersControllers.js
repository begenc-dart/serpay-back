const bcrypt = require('bcryptjs');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Seller } = require('../../models');
const { createSendToken } = require('./../../utils/createSendToken');
const sharp = require('sharp');
exports.getMe = catchAsync(async(req, res, next) => {
    return res.status(200).send(req.seller);
});

exports.updateMyPassword = catchAsync(async(req, res, next) => {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    console.log(req.body)
    if (!currentPassword || !newPassword)
        return next(
            new AppError(
                'You have to provide your current password and new password',
                400
            )
        );

    if (newPassword != newPasswordConfirm || newPassword.length < 6)
        return next(
            new AppError(
                'New Passwords are not the same or less than 6 characters',
                400
            )
        );

    const user = await Seller.findOne({ where: { seller_id: [req.seller.seller_id] } });

    if (!(await bcrypt.compare(currentPassword, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    createSendToken(user, 200, res);
});

exports.updateMe = catchAsync(async(req, res, next) => {
    const { name, address } = req.body;
    if (!name || !address)
        return next(new AppError('Invalid credentials', 400));

    const seller = await Seller.findOne({ where: { seller_id: [req.seller.seller_id] } });
    let isActive = false
    await seller.update({
        name,
        isActive,
        address
    });

    createSendToken(seller, 200, res);
});

exports.deleteMe = catchAsync(async(req, res, next) => {
    if (req.body.user_phone != req.seller.user_phone) {
        return next(new AppError('Phone number is not correct', 400));
    }
    await Seller.destroy({ where: { user_phone: req.user.user_phone } });

    res.status(200).send('User Successfully Deleted');
});
exports.uploadSellerImage = catchAsync(async(req, res, next) => {
    const updateSeller = await Seller.findOne({ where: { seller_id: req.seller.seller_id } });
    req.files = Object.values(req.files)
    if (!updateSeller)
        return next(new AppError('Brand did not found with that ID', 404));

    const image = `${req.seller.seller_id}_seller.webp`;
    const photo = req.files[0].data
    let buffer = await sharp(photo).webp().toBuffer()

    await sharp(buffer).toFile(`static/${image}`);

    await updateSeller.update({
        image,
    });
    return res.status(201).send(updateSeller);
});