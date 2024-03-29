
const express = require('express');
const {
    addProduct,
    editProduct,
    uploadProductImage,
    deleteProduct,
    editProductStatus,
    getAllActiveProducts,
    getAllNonActiveProducts,
    getOneProduct,
    uploadProductImagebyColor,
    addColor,
    addSize,
    editSize,
    editColor,
    uploadDetails,
    deleteProductColor,
    deleteProductImage,
    setId,
    deleteDetailImage,
    addSizeToColor,
    setExpireTime,
} = require('../../../controllers/admin/productsControllers');
const { login, protect } = require("../../../controllers/admin/adminControllers")
const router = express.Router();
router.get('/', getAllActiveProducts);
router.get("/set-expire",setExpireTime)
router.get("/:product_id", getOneProduct)
router.post("/add", addProduct)
router.post("/add/size/:id", addSize)
router.post("/add/size/to-color/:id", addSizeToColor)
router.post("/add/color/:id", addColor)
router.patch("/color/:id", editColor)
router.patch('/:id', editProduct);
router.patch("/size/:id", editSize)
router.patch('/edit-status/:id', editProductStatus);
router.post('/delete/:id', deleteProduct);
router.post("/delete/color/:id", deleteProductColor)
router.post('/upload-image/:id', uploadProductImage);
router.post("/upload-image/by-color/:id", uploadProductImagebyColor)
router.post("/upload-details/:id", uploadDetails)
router.post("/delete/image/:id", deleteProductImage)
router.post("/delete/detail/:id", deleteDetailImage)
router.put("/set-image-id", setId)
module.exports = router;