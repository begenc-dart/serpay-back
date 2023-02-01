const bcrypt = require('bcryptjs');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Seller } = require('../../models');
const jwt = require("jsonwebtoken")

const signToken = (id) => {
    return jwt.sign({ id }, 'rustam', {});
};
exports.protect = catchAsync(async(req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged as a Seller!.', 401));
    }
    const decoded = await jwt.verify(token, 'rustam');
    const seller = await Seller.findOne({ where: { seller_id: decoded.id } });
    if (!seller) {
        return next(
            new AppError('The user belonging to this token is no longer exists', 401)
        );
    }
    req.seller = seller;
    next();
});
exports.getMe = catchAsync(async(req, res, next) => {
    return res.status(200).send(req.user);
});

exports.updateMyPassword = catchAsync(async(req, res, next) => {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

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

    const user = await Seller.findOne({ where: { seller_id: [req.user.seller_id] } });

    if (!(await bcrypt.compare(currentPassword, user.user_password))) {
        return next(new AppError('Your current password is wrong', 401));
    }

    user.user_password = await bcrypt.hash(newPassword, 12);
    await user.save();

    createSendToken(user, 200, res);
});

exports.updateMe = catchAsync(async(req, res, next) => {
    const { user_name, user_address } = req.body;
    if (!user_name || !user_address)
        return next(new AppError('Invalid credentials', 400));

    const user = await Seller.findOne({ where: { seller_id: [req.user.seller_id] } });

    await user.update({
        user_name,
        user_address,
    });

    createSendToken(user, 200, res);
});

exports.deleteMe = catchAsync(async(req, res, next) => {
    if (req.body.user_phone != req.user.user_phone) {
        return next(new AppError('Phone number is not correct', 400));
    }

    await Seller.destroy({ where: { user_phone: req.user.user_phone } });

    res.status(200).send('User Successfully Deleted');
});
exports.login = catchAsync(async(req, res, next) => {
    const { phone_number, password } = req.body;
    if (!phone_number || !password) {
        return next(new AppError('Please provide name and  password', 400));
    }
    const seller = await Seller.findOne({ where: { phone_number } });
    if (!seller || !(await bcrypt.compare(password, seller.password))) {
        return res.status(401).send({ message: "Incorrect user phone or password" })
    }

    createSendToken(seller, 200, res);
});
const createSendToken = (seller, statusCode, res) => {
    const token = signToken(seller.seller_id);

    res.cookie('jwt', token, {
        httpOnly: true,
    });

    res.status(statusCode).json({
        token,
        data: {
            seller,
        },
    });
};