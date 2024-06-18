import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js' //ya error throw kay liay use kia hay file 

import { User } from "../models/user.models.js"; //ya models may jo user hay aus ko imp kia ta kay user ki hay ya nahi ya check kar sakin Q kay ya file mongoose nay model bani hay 

import { uploadOnCloudinary } from "../utils/cloudinary.js";

import { ApiResponce } from "../utils/ApiResponce.js";





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
console.log('username',username); //ais ko test kay liay postman pay gay aur apna url dala localhost:8000/api/v1/users/register phir raw may ham nay email dali are send kia to log hoa data 


// 2 check validations
if (
    [fullname,email, username, password].some((filed) => filed?.trim() === "")//filde hay to trim kro ager phir bhi empty hy to true return ho ga to error a jay ga kisi ak nay bhi true return kia 
        //some method check karay ga condition sahi hay to true data hay varna false data hay 
){
    throw new ApiError(400,'fullname is required')
}


//3- checking if userExist or not

const existedUser = User.findOne({
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
    uername:uername.toLowerCase()
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
    




export {
    registerUser,
}