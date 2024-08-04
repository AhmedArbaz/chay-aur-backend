import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js' //ya error throw kay liay use kia hay file 

import { User } from "../models/user.models.js"; //ya models may jo user hay aus ko imp kia ta kay user ki hay ya nahi ya check kar sakin Q kay ya file mongoose nay model bani hay 

import { uploadOnCloudinary } from "../utils/cloudinary.js";

import { ApiResponce } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";



const generateAccessAndRefreshTokens = async(userId)=>{
    try {
const user = await User.findById(userId)
const accessToken = user.generateAccessToken()
const refreshToken = user.generateRefreshToken()

user.refreshToken = refreshToken
 await user.save({validateBeforeSave: false}) // yaha sari validation khatam kar di kay hata do validation ko Q kay varn password required hay phir aus ko dalna paray ga to ais liay ham nay bola hamin pata hay tum direct save karo vaha ja kay 

 return{accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went worng while generating refresh and access token")
    }

}



//asyncHandler ak function banaya tha jo kay higher order function hay Q kay ya ak function ko as argumente lata hay call back ,pormisses vala jo code tha aus may samja tha ya ya phir typescript ki class may samja tha aus may zada acha samaj aya tha 

const registerUser = asyncHandler(async (req,res)=>{ //vasay to req,res,err,next hota hay 
   //get data/details from user/frontend
   //validation sab sahi bhaja hay ya nahi saray required mil gay ya nahi eg (not empty)
    //    check if user already exists: username,email
    // check for images, check for avatar
    // upload them to cloudinary, avatar 
    // create user obj -create entry in bd
    // remove password and refresh token field from responce (then send to frontend)
    // check for user creation
    // return res
    // or error

    //ya sab to hamin .body say mil jain gi lakin jo hamari files hain eg. images,aur avtar aus ka dakin gay abhi 
    const {fullname,email,username,password} = req.body 
console.log("email:",email);
 //ais ko test kay liay postman pay gay aur apna url dala localhost:8000/api/v1/users/register phir raw may ham nay email dali are send kia to log hoa data 


// 2 check validations
if (
    [fullname,email, username, password].some((field) => field?.trim() === "")//filde hay to trim kro ager phir bhi empty hy to true return ho ga to error a jay ga kisi ak nay bhi true return kia 
        //some method check karay ga condition sahi hay to true data hay varna false data hay 
){
    throw new ApiError(400,'All fields are required')
}


//3- checking if userExist or not

const existedUser = await User.findOne({
    $or:[{username},{email}] //asay ham $ or dal kay array do aur phir jitnay bhi check karnay hain aun ka obj day do  
})
if(existedUser){
    throw new ApiError(409,"user with emil or username already exists")
}

// 4. checking avatar
// yaha phalay ham req.body kar rhay thay lakin ab ham nay middlewar use kia hay multer to vo access data hay files ka to ham ya kar sakty hain kay 


const avatarLocalPath = req.files?.avatar[0]?.path;
// const coverImageLocalPath = req.files?.coverImage[0]?.path;

// This checks if there is a cover image or not because we don't add it required so we add validation
let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path
}

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
}

//5. upload on cloudnary 
//file bana li thi ausi ki imp karo aus may sara dala tha 
const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

// 6. again check for avater
if(!avatar){
    throw new ApiError(400,"Avatar file is required")
}

// 7. if all good then add entry on db
const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
})

// 8. checking and removing password,refreshToken from entry 

//ham nay jo id ay gi user may aus ko liay aur bola selet karo phir -ve sign may likha password -refreshToken ais ka matlab hay sab ko select karo ain ko chor kay 
const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" 
)

// 9 checking the user creation

if(!createdUser){
    throw new ApiError(500,"Something went worng while registring the user")
}


// 10 returning responce by utility ApiResponce file 

return res.status(201).json(
    new ApiResponce(200,createdUser,"User registered Successfully")
)





})


const loginUser = asyncHandler(async (req,res) =>{
    //req body -> data
    // username or email 
    // find the user
    // password check
    // access and refresh token 
    //send cookie



    //1. req body -> data

    const {email,username,password} = req.body
    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }



    //2. username or email 
     
    const user = await User.findOne({
        $or: [{username},{email}] // ya mongodb ka operator hay jo kay use karta hay aray may obj kay elements ko 
    })

    if(!user){
        throw new ApiError(404,"user does not exist")
    }


    //4. password check

    //ham ager User ya vala likhin gay to jo ham nay khud methods banay hain isPasswordCorrect valay to nahi milin gay Q kay ham nay User ko user may store karaya hay user hamara vapis call kia hay to aus ko user may store karaya hay 
const isPasswordValid = await user.isPasswordCorrect(password)
if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid user credentials')
}

    //5. access and refresh token 

   const {accessToken,refreshToken} =  await generateAccessAndRefreshTokens(user._id) //auper method bana dia Q kay agay bhi refresh, access tokens ko use karin gay to ais liay method bana kay use karin to zada acha hay 


//    optional ager user ko ya dana hay to do varna nahi do 
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
   
   
   //    6.send cookies 
const options = {
    httpOnly:true, // ya ham nay kia hay kay koi bhi front-end say change na karay cookie ko only server say hi change ho sakti hain bas
    secure: true,
}

//ya ham nay cookie-parser download kia tha package aus say ay ga 
return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
    new ApiResponce(200,{user:loggedInUser,accessToken,refreshToken},"User logged in Successfully")
)

})
    
// ab logout user bana rahay hain 
const logoutUser = asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
        req.user._id,
        {
            //update karna kia hay to ham mongodb ka opearator use karin gay ya lata hay kia kia update karna hay bata do obj may 
            $set: {
                refreshToken: undefined
            }
        },
       
       {
           new: true
       } 
    )

    const options = {
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponce(200,{},"User logged Out"))
})

// ya refresh token ka endpoint banin gay jo kay kam ay ga jab user ka access token expire ho jay ga to yaha say refresh kary ga token ko apny bar bar login karny say acha hay 
const refreshAccessToken = asyncHandler(async(req,res)=>{
const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
// ya 1st vala req.cookie for those how are not using the mobile and req.body for mobile users
if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")
}

try {
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.ACCESS_TOKEN_SECRET
    )
    // ham nay jab refresh token banaya tha user.model may vaha pay ham nay ja kay dakha kay refreshToken ko _id di this kay jab chahin to verify kar lain
    const user = await User.findById(decodedToken?._id)
    if (!user) {
        throw new ApiError(401,"invalid refresh token")
    }
    
    // ya refresh token vo hay jo ham nay user.model may banaya hay aur auth.middlewar may save karaya backend may 
    if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(401,"Refresh token is expired or used")
    }
    // ager yaha tak a gaya hay to token ho ga aus kay pass sahi vala to aus ko new token generate kar dain gay jo kay ham nay aisi vaja say sab say auper func bana lia tha 
    const options = {
    
        httpOnly: true,
        sercure:true
    }
    
    const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id)
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken:newrefreshToken},
            "Access Token refreshed"
        )
    )
} catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh token")
}
})

// Change password
const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect
    if(!isPasswordCorrect){
        throw new ApiError(400,"invalid old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponce(200,{},"password changed successfully"))
})

// getting current user
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(200,req.user,"current user fetched successfully")
})

// user Details updates 
const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullname,email} = req.body

    if(!fullname || !email){
        throw new ApiError(400,"All fields are required")
    }

const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullname,
            email:email,
        }
    },{new:true}
).select("-password")

return res.status(200).json(new ApiResponce(200,user,"Account details updated successfully"))

})

// Avatar updated
const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    (avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }
    //  ab update karna hay files ko to vo bhi same hi ho ga jasay auper kia hay updateDetails because ya bhi to ak obj hi to hay 
   const user = await User.findOneAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiError(200,user,"Avatar update Successfully")
    )
})

// coverImage updated
const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400,"Cover image file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    (coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on coverImage")
    }
    //  ab update karna hay files ko to vo bhi same hi ho ga jasay auper kia hay updateDetails because ya bhi to ak obj hi to hay 
    await User.findOneAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiError(200,user,"Cover Image update Successfully")
    )
})


// We use aggrigation here to get channel profile
const getUserChannelProfile = asyncHandler(async(req,res)=>{
const {username}= req.params //ya req.params for if we want to take data from url
if(!username?.trim()){
    throw new ApiError(400,"username is missing")
}
    const channel = await User.aggregate([
        {

            $match: {
                username:username?.toLowerCase(),
            }
        },

        //this is a method of aggrigation in mongoose
        // ya pipline hoti hay 
        {
            $lookup:{
                from:"subscriptions", //ya ham nay dakha tha kay sab lowercase aur plural ho jaty hain 
                localField:"_id",
                foreignField:"channel",
                as:"subscribers",
                // ya sari fields ham nay mongodb atlas may hi agregation may ja kay dakha kia needs hoti hain from,localField,foreignField,as ya sari
                
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo",
            }
            // lookup may to sab ko ak jaga pay kar lia tha ab sab ko add kar rahy hain
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers",// ya function hay jo kay use hota hay sab ko add karny kay liay
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo",
                },
                // yaha nichy ab ham check karna chahin gay kay subscribed hay ya nahi to agrigation hamin ak function data hay $cond: ais may if then,else hota hay jo kay condition hay 
                
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]}, //in jo hay ais may vo array bhi dakh lata hay aur sath hi may obj bhi 
                        then:true,
                        else:false,
                    }
                }
            }
        },
        {
            // ya project hota hay jo kay use karty hain selected cheezin dain gay jo pass karny hay ausy 1 do 
            $project:{
                fullname:1,
                username:1,
                avatar:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                coverImage:1,
                email:1,
            }
        },
        
    ])
    // checking ager chanel hi nahi hay 
if(!channel?.length){
    throw new ApiError(404,"Channel not found")
}
return res.status(200).json(new ApiResponce(200,channel[0],"Channel profile fetched successfully"))
})
// ham nay ak hi bar may 3 piplines likh di ak match kia , then lookup kia subscribers kitny hain through chanel info,then lookup kia aus nay kitnon ko subscribe kia hay subscriber info, phir count kar lia condition laga kay ya bhi dakh lia kay agrigation may condition kasy lagti hay 



// New agragiation pipline
const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.createFromHexString(req.user._id)
            }
        },
        {
            $lookup:{
                // ais lookup may ham any videos say watchhistory authai hay 
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {//ham nay lookup say vidoes say id lin lakin aun may owner bhi mix ho kay a gaya to aus ko khatam karny kay liay aisi may aur pipline laga kay nested pipline laga kay ham nay owner ko lay lia 
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                // ab owner to a gaya lakin aus kay sath aur sari fields bhi a gain to vo to nahi dani to ham nay ak aur pipline likhi but sath may yahi project laga dia to jo chiay vo lain gay baki choro
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1,
                                    }
                                },
                            ]
                        }
                    },
                    {
                        // ya ais liay banaya hay kay owner ka array ay ga to aus ko khatam karny kay liay aisi may first value lay li ya ham owner[0] asay bhi lay sakty thay
                        $addFields:{
                            owner:{
                                $first:"$owner",
                            }
                        },
                    }
                ]
            }
        },
    ])
    return res.status(200).json(new ApiResponce(200,user[0].watchHistory,"Watch history fetched successfully"))
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
}