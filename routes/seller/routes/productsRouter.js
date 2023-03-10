const express = require('express');
const {
    addProduct,
    getAllActiveProducts,
    getOneProduct,
    uploadExcel,
    addFromExcel,
    uploadZip,
} = require('../../../controllers/seller/productsControllers');
const {
    editProduct,
    uploadProductImagebyColor,
    addSizeToColor,
    uploadDetails,
    deleteDetailImage,
    deleteProductImage,
    uploadProductImage,
    deleteProduct,
    editProductStatus,
    addColor,
    addSize,
    editSize,
    editColor,
    deleteProductColor,
    setDiscount
} = require("../../../controllers/admin/productsControllers")
const router = express.Router();

router.get('/', getAllActiveProducts);
router.get("/:product_id", getOneProduct)
router.post("/add", addProduct)
router.post("/add/size/:id", addSize)
router.post("/add/color/:id", addColor)
router.post("/add/size/to-color/:id", addSizeToColor)
router.patch("/color/:id", editColor)
router.patch('/:id', editProduct);
router.patch("/size/:id", editSize)
router.patch('/edit-status/:id', editProductStatus);
router.post('/delete/:id', deleteProduct);
router.post('/upload-image/:id', uploadProductImage);
router.post("/upload-image/by-color/:id", uploadProductImagebyColor)
router.post("/upload-details/:id", uploadDetails)
router.post("/upload-excel",uploadExcel)
router.post("/upload-zip",uploadZip)
router.post("/upload-from-excel",addFromExcel)
router.post("/discount",setDiscount)
router.post("/delete/image/:id", deleteProductImage)
router.post("/delete/detail/:id", deleteDetailImage)
router.post("/delete/color/:id", deleteProductColor)
module.exports = router;