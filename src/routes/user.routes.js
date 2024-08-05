import { Router } from "express";
import  { getUserChannelProfile,
     getWatchHistory, 
     updateAccountDetails,
      updateUserAvatar,
       updateUserCoverImage,
       loginUser, 
       logoutUser, 
       registerUser,
       refreshAccessToken, 
       getCurrentUser,
       changeCurrentPassword,
    } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlerware.js";
import { verifyJWT } from "../middlewares/auth.middlewar.js";

// ya middleware ka upload use kia hay kay file ko kasay handle karin gay middleware hay to matlab kay janay say phalay mil kar jao to ais ko apny registerUser say phalay laga dain gay 


const router = Router()

//to jsay hi koi /register pay ata hay to .post registerUser run hota hay to aus kay run hony say phalay ham middleware ko lagin gay 
router.route("/register").post(

    upload.fields([
        {
            name:"avatar",
            maxCount: 1,
        },
        {
            name:"coverImage",
            maxCount:1
        }

    ]),
       registerUser)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,logoutUser)

// refreshtokenRout route
router.route("/refresh-token").post(refreshAccessToken)

// change password
router.route("/change-password").post(verifyJWT,changeCurrentPassword)//ya verify jwt say phalay verify ho ga kay login hoa banda kar raha hay ya koi aur 

// current user kay liay 
router.route("/current-user").get(verifyJWT,getCurrentUser)

// update account details 
router.route("update-account-details").patch(verifyJWT,updateAccountDetails)

//NOTE: for update avatar here is updating the image so use upload.single("avatar")
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

// This is for coverImage same as avater becasue also here we upload the image
router.route('cover-image').patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
export default router

// NOTE: getUserChannelProfile ham .prams say data lay rahain hain userControler.js may dakho to ya data header say a raha hota hay 
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)// jab .params karty hain to url kuch asay banta hay / (koi bhi alphabet)/: jo info chaiya aus ka name likh do username,id etc. So kuch ya url ban jay ga (/a/:username)OR(/b/:username)OR(/z/:username)any alphabet can use after 1 slash

// watch history route kay liay bas user login hona chiay jo kay verifyJwT say pata chal jay ga
router.route("/watch-history").get(verifyJWT,getWatchHistory)
