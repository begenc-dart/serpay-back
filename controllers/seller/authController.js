const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Seller } = require('../../models');
const randomstring = require('randomstring');
const { createSendTokenSeller } = require('./../../utils/createSendToken');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
exports.verify_code_forgotten = catchAsync(async(req, res, next) => {
    if (req.body.phone) {
        const { phone } = req.body;
        const seller = await Seller.findOne({ where: { number: phone } });
        if (!seller) {
            return next(new AppError('This number has not signed as seller', 400));
        }
        const generated_code = randomstring.generate({
            charset: "123456789",
            length: 6
        })
        const obj = {
            number: phone,
            sms: 'Serpay tassyklaýyş koduňyz: ' + generated_code,
        };
        var io = req.app.get('socketio');
        io.emit("verification-phone", obj)
        res.status(200).json({ generated_code: generated_code });
    } else next();
});
exports.login = catchAsync(async(req, res, next) => {
    const { nickname, password } = req.body
    const seller = await Seller.findOne({ where: { nickname } })
    if (!seller || !(await bcrypt.compare(password, seller.password))) {
        return next(new AppError('Incorrect username or password', 401));
    }
    seller.password = undefined
    createSendTokenSeller(seller, 200, res)

})
exports.protect = catchAsync(async(req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next(
        new AppError('You are not logged in', 401)
    );

    const decoded = jwt.verify(token, 'rustam');

    const freshSeller = await Seller.findOne({ where: { seller_id: [decoded.id] } });

    if (!freshSeller) {
        return next(
            new AppError('The user belonging to this token is no longer exists', 401)
        );
    }
    freshSeller.password = undefined
    req.seller = freshSeller;
    next();
});
exports.forgotPassword = catchAsync(async(req, res, next) => {
    if (req.body.user_checked_phone) {
        const { user_checked_phone, newPassword, newPasswordConfirm } = req.body;
        if (newPassword != newPasswordConfirm) return next(new AppError('Passwords are not the same', 400));
        const seller = await Seller.findOne({
            where: { number: user_checked_phone },
        });
        if (!seller) return next(new AppError('User not found', 404));
        seller.password = await bcrypt.hash(newPassword, 12);
        await seller.save();
        createSendToken(seller, 200, res);
    } else {
        res.send(400).json({
            msg: 'Firstly you have to verify your number',
        });
    }
});