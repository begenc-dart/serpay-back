const express = require('express');
const {
    addProduct,
    getAllActiveProducts,
    getOneProduct,
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
    deleteProductColor
} = require("../../../controllers/admin/productsControllers")
const router = express.Router();

router.get('/', getAllActiveProducts);
router.get("/:product_id", getOneProduct)
router.post("/add", addProduct)
router.post("/add/size/:id", addSize)
router.post("/add/color/:id", addColor)
router.post("/add/size/to-color", addSizeToColor)
router.patch("/color/:id", editColor)
router.patch('/:id', editProduct);
router.patch("/size/:id", editSize)
router.patch('/edit-status/:id', editProductStatus);
router.delete('/:id', deleteProduct);
router.post('/upload-image/:id', uploadProductImage);
router.post("/upload-image/by-color/:id", uploadProductImagebyColor)
router.post("/upload-details/:id", uploadDetails)
router.delete("/image/:id", deleteProductImage)
router.delete("/detail/:id", deleteDetailImage)
router.delete("/color/:id", deleteProductColor)
module.exports = router;