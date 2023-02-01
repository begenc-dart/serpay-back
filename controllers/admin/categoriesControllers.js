const fs = require('fs');
const sharp = require("sharp")
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const {
    Categories,
    Subcategories,
    Products,
    Stock,
    Brands,
    Categoriesbrands,
} = require('../../models');

exports.addCategory = catchAsync(async(req, res) => {
    const newCategory = await Categories.create(req.body);
    return res.status(201).send(newCategory);
});
exports.addCategoryBrand = catchAsync(async(req, res, next) => {
    const category = await Categories.findOne({
        where: { category_id: req.params.id },
    });
    if (!category)
        return next(new AppError('Ctegory did not found with that ID', 404));

    const brand = await Brands.findOne({
        where: { brand_id: req.body.brand_id },
    });
    if (!brand)
        return next(new AppError('Brand did not found with brand_id', 404));
    await Categoriesbrands.create({
        brandId: brand.id,
        categoryId: category.id,
    });
    return res.status(201).json({
        msg: 'Successfully added',
    });
});

exports.editCategory = catchAsync(async(req, res, next) => {
    const category = await Categories.findOne({
        where: { category_id: req.params.id },
    });

    if (!category)
        return next(new AppError('Category did not found with that ID', 404));

    const { name_tm, name_ru, name_en } = req.body;
    if (
        typeof name_tm !== 'string' ||
        name_tm.length < 1 ||
        typeof name_ru !== 'string' ||
        name_ru.length < 1
    )
        return next(new AppError('Invalid Credentials', 400));

    await category.update({ name_tm, name_ru, name_en });

    return res.status(200).send(category);
});

exports.deleteCategory = catchAsync(async(req, res, next) => {
    const category_id = req.params.id;
    const category = await Categories.findOne({ where: { category_id } });



    if (!category)
        return next(new AppError('Category did not found with that ID', 404));

    const products = await Products.findAll({
        where: { categoryId: [category.id] },
    });

    if (products) {
        products.forEach(async(product) => {
            if (product.image) {
                fs.unlink(
                    `public/${product.image}`,
                    function(err) {
                        if (err) throw err;
                    }
                );
            }

            await Stock.destroy({ where: { productId: [product.id] } });
            await product.destroy();
        });
    }
    await category.destroy();

    return res.status(200).send('Successfully Deleted');
});
exports.getOneCategory = catchAsync(async(req, res, next) => {
    let { category_id } = req.params
    const category = await Categories.findOne({
        where: { category_id },
        include: {
            model: Subcategories,
            as: "category_subcategories"
        }
    });
    if (!category) {
        return next(new AppError("Category not found with that id", 404))
    }
    return res.status(200).send(category)
})
exports.uploadCategoryImage = catchAsync(async(req, res, next) => {
    const category_id = req.params.id;
    const category = await Categories.findOne({ where: { category_id } });
    req.files = Object.values(req.files)
    if (!category)
        return next(new AppError('category did not found with that ID', 404));
    const image = `${category_id}_category.webp`;
    const photo = req.files[0].data
    let buffer = await sharp(photo).webp().toBuffer()
    await sharp(buffer).toFile(`static/${image}`);

    await category.update({
        image,
    });

    return res.status(201).send(category);
});