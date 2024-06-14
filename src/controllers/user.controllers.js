import { asyncHandler } from "../utils/asyncHandler.js";

//asyncHandler ak function banaya tha jo kay higher order function hay Q kay ya ak function ko as argumente lata hay call back ,pormisses vala jo code tha aus may samja tha ya ya phir typescript ki class may samja tha aus may zada acha samaj aya tha 

const registerUser = asyncHandler(async (req,res)=>{ //vasay to req,res,err,next hota hay 
    res.status(200).json({
        message:"ok"
    })

} )


export {
    registerUser,
}