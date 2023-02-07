const express=require("express");
const { getAllChats,getOneChat } = require("../../../controllers/users/chatsController");
const router=express.Router();

router.get('/', getAllChats)
router.get("/:nickname",getOneChat)
module.exports=router