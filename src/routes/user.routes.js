import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlerware.js";
// ya middleware ka upload use kia hay kay file ko kasay handle karin gay middleware hay to matlab kay janay say phalay mil kar jao to ais ko apny registerUser say phalay laga dain gay 


const router = Router()

//to jsay hi koi /register pay ata hay to .post registerUser run hota hay to aus kay run hony say phalay ham middleware ko lagin gay 
router.route("/register").post(

    upload.fields([
        {
            name:"avater",
            maxCount: 1,
        },
        {
            name:"coverImage",
            maxCount:1
        }

    ]),
       registerUser)

export default router