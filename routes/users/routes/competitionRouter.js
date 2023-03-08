const express= require("express")
const router=express.Router()
const{enterToCompetition,addOne,generateLink,getMyResult,deleteCompetitor,addOneFromLink}=require("../../../controllers/users/competitionController")

router.post("/add",  enterToCompetition)
router.post("/add-one",  addOne)
router.post("/add-one/from-link", addOneFromLink)
router.get("/link",  generateLink)
router.post("/delete/:id",  deleteCompetitor)
router.get("/me/:id",  getMyResult)


module.exports =router