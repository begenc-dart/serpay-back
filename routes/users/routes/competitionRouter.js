const express= require("express")
const router=express.Router()
const{enterToCompetition,addOne,generateLink,getMyResult,deleteCompetitor}=require("../../../controllers/users/competitionController")

router.post("/add",  enterToCompetition)
router.post("/add-one",  addOne)
router.post("/link",  generateLink)
router.post("/delete/:id",  deleteCompetitor)
router.get("/me/:id",  getMyResult)


module.exports =router