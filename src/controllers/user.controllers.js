import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js' //ya error throw kay liay use kia hay file 

import { User } from "../models/user.models.js"; //ya models may jo user hay aus ko imp kia ta kay user ki hay ya nahi ya check kar sakin Q kay ya file mongoose nay model bani hay 

import { uploadOnCloudinary } from "../utils/cloudinary.js";

import { ApiResponce } from "../utils/ApiResponce.js";



const generateAccessAndRefreshTokens = async(userId)=>{
    try {
const user = await User.findById(userId)
const accessToken = user.generateAccessToken()
const generaTetoken = user.generateRefreshToken()

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
    [fullname,email, username, password].some((filed) => filed?.trim() === "")//filde hay to trim kro ager phir bhi empty hy to true return ho ga to error a jay ga kisi ak nay bhi true return kia 
        //some method check karay ga condition sahi hay to true data hay varna false data hay 
){
    throw new ApiError(400,'fullname is required')
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


const avatarLocalPath = req.files?.avater[0]?.path;
const coverImageLocalPath = req.files?.coverImage[0]?.path;

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
}

//5. upload on cloudnary 
//file bana li thi ausi ki imp karo aus may sara dala tha 
const avater = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

// 6. again check for avater
if(!avater){
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
    if(!(username || !email)){
        throw new ApiError(400,"username or password is required")
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



export {
    registerUser,
    loginUser,
    logoutUser,
}