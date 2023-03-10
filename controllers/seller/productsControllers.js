const Op = require('sequelize').Op;
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const reader=require('xlsx');
var AdmZip = require("adm-zip");
const fs=require("fs")
const {v4}=require("uuid")
const sharp=require("sharp")
const {
    Products,
    Categories,
    Subcategories,
    Stock,
    Brands,
    Images,
    Productsizes,
    Productcolor,
    Details
} = require('../../models');
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.getAllActiveProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    let { keyword, categoryId, subcategoryId } = req.query;
    var where = {};
    if (keyword && keyword != "undefined") {
        let keywordsArray = [];
        keyword = keyword.toLowerCase();
        keywordsArray.push('%' + keyword + '%');
        keyword = '%' + capitalize(keyword) + '%';
        keywordsArray.push(keyword);
        where = {
            [Op.or]: [{
                    name_tm: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
                {
                    name_ru: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
            ],
        };
    }

    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    where.sellerId = req.seller.id
    const products = await Products.findAll({
        where,
        limit,
        offset,
        include: {
            model: Images,
            as: "images",
            limit: 4
        },
        order: [
            ['updatedAt', 'DESC'],
            // ["images", "id", "DESC"]
        ],
    });
    const count = await Products.count({where})
    return res.status(200).send({ products, count });
});
exports.getOneProduct = catchAsync(async(req, res, next) => {
    const { product_id } = req.params
    const oneProduct = await Products.findOne({
        where: { product_id },
        include: [{
                model: Productcolor,
                as: "product_colors",
                include: [{
                        model: Images,
                        as: "product_images"
                    },
                    {
                        model: Productsizes,
                        as: "product_sizes"

                    }
                ]
            },
            {
                model: Productsizes,
                as: "product_sizes"
            },
            {
                model: Details,
                as: "details"
            },
            {
                model: Images,
                as: "images"
            },
            {
                model: Categories,
                as: "category"
            },
            {
                model: Subcategories,
                as: "subcategory"
            }
        ]
    })
    return res.send(oneProduct)
})
exports.addProduct = catchAsync(async(req, res, next) => {
    const category = await Categories.findOne({
        where: { category_id: req.body.category_id },
    });
    req.body.isActive = false
    if (!category)
        return next(new AppError('Category did not found with that ID', 404));
    if (req.body.subcategory_id) {
        const subcategory = await Subcategories.findOne({
            where: { subcategory_id: [req.body.subcategory_id] },
        });
        if (!subcategory)
            return next(new AppError('Sub-category did not found with that ID', 404));
        req.body.subcategoryId = subcategory.id;
    }
    if (req.body.brand_id) {
        const brand = await Brands.findOne({
            where: { brand_id: req.body.brand_id }
        })
        if (!brand)
            return next(new AppError("Brand did not found with that Id"), 404)
        req.body.brandId = brand.id
    }
    const date = new Date()
    req.body.is_new_expire = date.getTime()
    req.body.stock = Number(req.body.stock)
    req.body.categoryId = category.id;
    req.body.price_old=null
    if (Number(req.body.discount) > 0) {
        req.body.price_old = req.body.price;
        req.body.price =(req.body.price / 100) *(100 - req.body.discount);
    }
    req.body.sellerId = req.seller.id
    const newProduct = await Products.create(req.body);
    let stock_data = {}

    if (req.body.quantity) {
        stock_data.quantity = req.body.quantity
        stock_data.productId = newProduct.id
        await Stock.create(stock_data)
    }
    return res.status(201).send(newProduct)
})
exports.uploadExcel=catchAsync(async(req,res,next)=>{
    req.files = Object.values(req.files)
    const image = `${req.seller.seller_id}_products.xlsx`;
    const photo = req.files[0]
    photo.mv(`./static/${image}`,(err)=>{
        if(err) return next(new AppError("Somethin went wrong",500))
    })
    return res.status(201).send("Sucess");
})
exports.uploadZip=catchAsync(async(req,res,next)=>{
    req.files = Object.values(req.files)
    const image = `${req.seller.id}_images.zip`;
    const photo = req.files[0].data
    if (!fs.existsSync(`./seller_images/${req.seller.id}`)){
        fs.mkdirSync(`./seller_images/${req.seller.id}`)
    }
    fs.writeFileSync(`./seller_images/${req.seller.id}/${req.seller.id}_images.zip`, photo);
    console.log(`./seller_images/${req.seller.id}/${req.seller.id}_images.zip`)
    var zip = new AdmZip(`./seller_images/${req.seller.id}/${req.seller.id}_images.zip`);
    zip.extractAllTo(/*target path*/ `./seller_images/${req.seller.id}/`, /*overwrite*/ true);

    return res.status(201).send("Sucess");
})
exports.addFromExcel=catchAsync(async(req,res,next)=>{
    const filename="./static/"+req.seller.seller_id+"_products.xlsx"
    const file = reader.readFile(filename)
      
    let data = []
      
    const sheets = file.SheetNames
      
    for(let i = 0; i < sheets.length; i++)
    {
       const temp = reader.utils.sheet_to_json(
            file.Sheets[file.SheetNames[i]])
       temp.forEach((res) => {
          data.push(res)
       })
    }
    for(let oneData of data){
        const obj={
            name_tm:oneData.name_tm,
            name_ru:oneData.name_ru,
            body_ru:oneData.body_ru,
            body_tm:oneData.body_tm,
            product_code:oneData.product_code,
            price:oneData.price,
            discount:oneData.discount,
            isAction:oneData.isAction,
            categoryId:11,
            subcategoryId:25,
            price_old:null,
            sellerId:req.seller.id
        }
        const date = new Date()

        oneData.is_new_expire = date.getTime()
        if (Number(req.body.discount) > 0) {
            obj.price_old = req.body.price;
            obj.price =(req.body.price / 100) *(100 - oneData.discount);
        }
        console.log(obj)
        const newProduct = await Products.create(obj);
        if(oneData.sizes){
            
            var sizes = []
            oneData.sizes=oneData.sizes.split(" ")
            if(oneData.sizes_discount) oneData.sizes_discount=oneData.sizes_discount.split(" ")
            if(oneData.sizes_quantity) oneData.sizes_quantity=oneData.sizes_quantity.split(" ")
            oneData.sizes_price=oneData.sizes_price.split(" ")

                for (let i = 0; i < oneData.sizes.length; i++) {
                    let data = {}
                    data.price_old = null;
                    if (oneData.sizes_discount!=undefined && oneData.sizes_discount != []) {
                        data.discount = oneData.sizes_discount[i]
                        data.price_old = oneData.sizes_price[i]
                        data.price = (data.price_old / 100) * (100 - oneData.sizes_discount[i])
                    }
                    data.price = oneData.sizes_price[i]
                    data.size = oneData.sizes[i]
                    data.productId = newProduct.id
                    let product_size = await Productsizes.create(data)
                    sizes.push(product_size)
                    data.productsizeId = product_size.id
                    data.quantity = oneData.sizes_quantity[i]
                    await Stock.create(data);
                }
            
                }
                let stock_data={}
                if (oneData.stock) {
                    stock_data.quantity = oneData.quantity
                    stock_data.productId = newProduct.id
                    await Stock.create(stock_data)
                }           
                const imagesArray=oneData.image.split(",")
                for (const images of imagesArray) {
                    console.log(images,256)
                    const image_id = v4()
                    const image = `static/${image_id}_product.webp`;
                    const photo = `seller_images/${req.seller.id}/${images}`
                    let buffer = await sharp(photo).resize(1080,720).webp().toBuffer()
                    await sharp(buffer).toFile(image);
                    let newImage = await Images.create({ image, image_id, productId: newProduct.id })
                }
    }
    return res.send(data)
})