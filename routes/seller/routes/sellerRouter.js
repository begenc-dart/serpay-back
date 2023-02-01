 const express = require('express');
 const {
     login,
     protect,
     verify_code_forgotten,
     forgotPassword
 } = require('../../../controllers/seller/authController');
 const {
     getMe,
     updateMyPassword,
     updateMe,
     deleteMe,
     uploadSellerImage
 } = require('../../../controllers/seller/usersControllers');
 const router = express.Router();
 router.patch('/forgot-password', verify_code_forgotten, forgotPassword);
 router.get('/my-account', protect, getMe);
 router.patch('/', protect, updateMe);
 router.delete('/delete-me', protect, deleteMe);
 router.patch('/update-my-password', protect, updateMyPassword);
 router.post("/upload-image/", protect, uploadSellerImage);
 module.exports = router;