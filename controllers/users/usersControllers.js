const bcrypt = require("bcryptjs");
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Users, Sharingusers, Freeproducts, Userhistory, Enteredusers, Products, Images, Likedproducts, Cards } = require('../../models');
const { createSendToken } = require('./../../utils/createSendToken');
const { Op } = require("sequelize")
const sharp = require("sharp")
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
    const user = await Users.findOne({ where: { user_id: [req.user.user_id] } });
    if (!(await bcrypt.compare(currentPassword, user.password))) {
        return next(new AppError('Your current password is wrong', 400));
    }
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    createSendToken(user, 200, res);
});

exports.updateMe = catchAsync(async(req, res, next) => {
    console.log(req.body)
    const { username, nickname, } = req.body;
    if (!username || !nickname)
        return next(new AppError('Invalid credentials', 400));

    const user = await Users.findOne({ where: { user_id: [req.user.user_id] } });

    const has_username = await Users.findOne({ where: { nickname } })

    if (has_username) {
        if (has_username.user_id != req.user.user_id) return next(new AppError("This nickname is already taken"))
    }
    await user.update({
        username,
        nickname
    });
    console.log(user)
    createSendToken(user, 200, res);
});

exports.deleteMe = catchAsync(async(req, res, next) => {
    if (req.body.user_phone != req.user.user_phone) {
        return next(new AppError('Phone number is not correct', 400));
    }

    await Users.destroy({ where: { user_phone: req.user.user_phone } });

    res.status(200).send('User Successfully Deleted');
});

exports.addMyHistory = catchAsync(async(req, res, next) => {
    req.body.userId = req.user.id
    const product = await Products.findOne({ where: { product_id: req.body.product_id } })
    req.body.productId = product.id
    let address = await Userhistory.create(req.body)
    return res.status(201).send(address)

})
exports.getAllHistory = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20
    const offset = req.query.offset || 0
    let user_history = await Userhistory.findAll({
        where: { userId: req.user.id },
        limit,
        offset,
        order: [
            ["createdAt", "DESC"]
        ],
        include: {
            model: Products,
            as: "product",
            include: {
                model: Images,
                as: "images"
            }
        }
    })
    for (let i = 0; i < user_history.length; i++) {
        const liked_ids = await Likedproducts.findOne({
            where: {
                [Op.and]: [{ userId: req.user.id }, { productId: user_history[i].product.id }]
            }
        })
        if (liked_ids) user_history[i].product.isLiked = true
    }
    return res.status(200).send(user_history)
})
exports.deleteMyHistory = catchAsync(async(req, res, next) => {
    const { history_ids } = req.body
    console.log(136, req.body)
    for (let i = 0; i < history_ids.length; i++) {
        const user_history = await Userhistory.findOne({ where: { history_id: history_ids[i] } })
        if (!user_history) return next(new AppError("User history not found with that id", 404))
        await user_history.destroy()
    }
    return res.status(200).send({ msg: "Success" })
})
exports.deleteAllHistory = catchAsync(async(req, res, next) => {
    const user_histories = await Userhistory.findAll({ where: { userId: req.user.id } })
    for (let i = 0; i < user_histories.length; i++) {
        await Userhistory.destroy({ where: { history_id: user_histories[i].history_id } })
    }
    return res.status(200).send({ msg: "Sucess" })
})
exports.enterToCompetition = catchAsync(async(req, res, next) => {
    const { freeproduct_id } = req.body
    const freeproduct = await Freeproducts.findOne({ where: { freeproduct_id } })
    if (!freeproduct) return next(new AppError("Product with that not found", 404))
    req.body.freeproductId = freeproduct.id
    req.body.userId = req.user.id
    const has = await Sharingusers.findOne({ where: { freeproductId: freeproduct.id, userId: req.user.id } })
    if (has) return next(new AppError("You are already competing", 403))
    const sharing_user = await Sharingusers.create(req.body)
    return res.status(201).send(sharing_user)
})
exports.generateLink = catchAsync(async(req, res, next) => {
    const freeproduct = await Freeproducts.findOne({ where: { freeproduct_id: req.body.freeproduct_id } })
    if (!freeproduct) return next(new AppError("Free product with that id not found", 404))
    const sharing_user = await Sharingusers.findOne({ where: { freeproductId: freeproduct.id, userId: req.user.id } })
    const link = "http://10.192.168.23:3000/hyzmatlar/share/" + freeproduct.freeproduct_id + "?sharinguser_id=" + sharing_user.sharinguser_id
    return res.status(200).send(link)
})
exports.addOne = catchAsync(async(req, res, next) => {
    const sharing_user = await Sharingusers.findOne({ where: { sharinguser_id: req.body.sharinguser_id } })
    if (!sharing_user) return next(new AppError("Sharing user with that id not found"), 404)
    const freeproduct = await Freeproducts.findOne({ where: { freeproduct_id: req.body.freeproduct_id } })
    if (!freeproduct) return next(new AppError("Free product with that id not found"), 404)
    const entered_user = await Enteredusers.findOne({
        where: {
            [Op.and]: [{ sharinguserId: sharing_user.id }, { freeproductId: freeproduct.id }, { entereduserId: req.user.id }]
        }
    })
    if (!entered_user) {
        var new_entered_user = await Enteredusers.create({ sharinguserId: sharing_user.id, isEntered: true, freeproductId: freeproduct.id, entereduserId: req.user.id })
        await sharing_user.update({
            count: sharing_user.count + 1
        })
    }

    return res.status(200).send({ sharing_user, new_entered_user })
})
exports.deleteCompetitor = catchAsync(async(req, res, next) => {
    const sharing_user = await Sharingusers.findOne({ where: { userId: req.user.id, freeproductId: req.params.id } })

    sharing_user.destroy()
    return res.status(200).send({ msg: "Successfully deleted" })
})
exports.getMyResult = catchAsync(async(req, res, next) => {
    const freeproduct = await Freeproducts.findOne({ where: { freeproduct_id: req.params.id } })
    const sharing_users = await Sharingusers.findAll({ where: { freeproductId: freeproduct.id } })
    for (let i = 0; i < sharing_users.length; i++) {
        var index = i + 1
        if (sharing_users[i].userId == req.user.id) break
    }
    return res.status(200).send({ position: index })
})
exports.likeProduct = catchAsync(async(req, res, next) => {
    console.log(req.body)
    const product = await Products.findOne({ where: { product_id: req.body.product_id } })
    if (!product) return next(new AppError("Product with that id not found"))
    const liked_product = await Likedproducts.create({ userId: req.user.id, productId: product.id })
    await product.update({ likeCount: product.likeCount + 1 })
    return res.status(200).send({ liked_product, product })
})
exports.dislikeProduct = catchAsync(async(req, res, next) => {
    console.log(req.body)
    const product = await Products.findOne({ where: { product_id: req.params.id } })
    if (!product) return next(new AppError("Product with that id not found", 404))
    const liked_product = await Likedproducts.findOne({ where: { productId: product.id, userId: req.user.id } })
    if (!liked_product) return next(new AppError("Liked product with that id not found", 404))
    await liked_product.destroy()
    await product.update({ likeCount: product.likeCount - 1 })
    return res.status(200).send({ msg: "Success" })
})
exports.getUsersLikedProducts = catchAsync(async(req, res, next) => {
    console.log(req.body)
    const limit = req.query.limit || 20
    const offset = req.query.offset || 0
    const { sort } = req.query
    if (sort == 1) var order = [
        ["price", "DESC"]
    ]
    else if (sort == 2) var order = [
        ["price", "ASC"]
    ]
    else var order = [
        ["updatedAt", "DESC"]
    ]
    const liked_product = await Users.findOne({
        where: { user_id: req.user.user_id },
        include: {
            model: Products,
            as: "liked_products",
            include: {
                model: Images,
                as: "images"
            }
        }

    })
    return res.status(200).send({ liked_product: liked_product.liked_products })
})
exports.uploadUserImage = catchAsync(async(req, res, next) => {
    const user_id = req.user.user_id;
    const user = await Users.findOne({ where: { user_id } });
    req.files = Object.values(req.files)
    if (!user)
        return next(new AppError('User did not found with that ID', 404));
    const image = `${user_id}_user.webp`;
    const photo = req.files[0].data
    let buffer = await sharp(photo).webp().toBuffer()
    await sharp(buffer).toFile(`static/${image}`);
    await user.update({
        image
    });
    return res.status(201).send(user)

});
exports.createCard = catchAsync(async(req, res, next) => {
    // const CryptoJS = require("crypto-js")
    // var ciphertext = CryptoJS.AES.encrypt('my message is bet', 'secret key 123').toString();
    // console.log(ciphertext)
    //  var bytes = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
    //  var originalText = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(originalText)
    const { card_number } = req.body
    const card = await Cards.create({ card_number, userId: req.user.id })
    return res.status(200).send({ card })
})