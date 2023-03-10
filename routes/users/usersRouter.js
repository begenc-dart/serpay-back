const express = require('express');
const {
    login,
    signup,
    forgotPassword,
    protect,
    verify_code,
    verify_code_forgotten,
} = require('../../controllers/users/authController');
const { getMyCart, addMyCart, select, updateProduct, deleteProduct, isOrdered, deleteSelected, selectAll } = require('../../controllers/users/cartControllers');
const { getNotOrderedProducts, } = require('../../controllers/users/ordersControllers');
const {
    getMe,
    updateMyPassword,
    updateMe,
    updateMeAdmin,
    deleteMe,
    getAllHistory,
    addMyHistory,
    deleteMyHistory,
    likeProduct,
    dislikeProduct,
    getUsersLikedProducts,
    uploadUserImage,
    createCard,
    deleteAllHistory,
} = require('../../controllers/users/usersControllers');
const router = express.Router();
router.use("/products", protect, require("./routes/productsRouter"))
router.use("/address", protect, require("./routes/addressRouter"))
router.use("/chat", protect, require("./routes/chatsRouter"))
router.use("/seller", protect, require("./routes/sellerRouter"))
router.use("/my-orders", protect, require("./routes/ordersRouter"))
router.use("/competition", protect, require("./routes/competitionRouter"))
router.patch('/forgot-password', verify_code_forgotten, forgotPassword);
router.post('/signup', verify_code, signup);
router.get("/get-me", protect, getMe)
router.post('/login', login);
router.get('/my-account', protect, getMe);
router.patch('/update-me', protect, updateMe);
router.patch("/update-me/admin",protect,updateMeAdmin)
router.post('/delete-me', protect, deleteMe);
router.post("/upload-image", protect, uploadUserImage)
router.patch('/update-my-password', protect, updateMyPassword);
router.post("/history", protect, addMyHistory)
router.get("/history", protect, getAllHistory)
router.post("/delete/history", protect, deleteMyHistory)
router.post("/delete/history/all", protect, deleteAllHistory)
router.get('/my-cart', protect, getMyCart);
router.post("/to-my-cart", protect, addMyCart)
router.get("/is-ordered", protect, isOrdered)
router.patch("/my-cart/select/all",protect,selectAll)
router.patch("/my-cart/select/:id", protect, select)
router.patch("/my-cart/:id", protect, updateProduct)
router.get("/not-ordered", protect, getNotOrderedProducts)
router.post("/delete/not-ordered/:id", protect, deleteProduct)
router.post("/delete/not-ordered/multiple/", protect, deleteSelected)
router.get("/like", protect, getUsersLikedProducts)
router.post("/like", protect, likeProduct)
router.post("/delete/like/:id", protect, dislikeProduct)
router.post("/card", protect, createCard)
module.exports = router;