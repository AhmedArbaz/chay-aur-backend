import mongoose, { Schema } from "mongoose";
import  JsonWebTokenError  from "jsonwebtoken";
import bcrypt from 'bcrypt'

// bcrypt use hota hay password ko hash may change karnay kay liay aur 
//jwt or jsonwebtoken use hota hay cryptogryphy kay liay bcrypt bhi ais kay liay use hota hay 

const userSchema = new Schema({
    username:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim: true,
        index: true,// search kay time ya zada optimize ho ga 
    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim: true,
        // index: true, ya sahi hay varna zada heavy ho jay ga 
    },
    fullname:{
        type: String,
        required:true,
        trim: true,
        index: true,
    },
    avatar:{
        type: String, //cloudinary url
        required: true,

        
    },
    coverImage:{
        type: String,
       
    },
    watchHistory:[// ya thora tricky hay to ham nay array may store karaya hay
        {
            type: Schema.Types.ObjectId,
            ref:'Video',
        }
    ],
    password:{
        type:String,
        required:[true,'password is required']
    },
    refreshToken:{
        type:String,
    }
},{timestamps:true})

//ya jo save likha hay ais ki jaga aur bhi events dal saktay hain e.g validate,updateOne,deleteOne,remove,save

//ham yaha ais may arrow function use kar saktay hain lakin phir auper valay code ka referance chaiay to this lagay ga jo arrow function may nahi hota this. so function use karo aur time lagay ga to async bana kay use karo
userSchema.pre("save",async function (next) {// next last class may 

    if(!this.isModified('password')) return next();
    //ya bola !nahi hay modified to return karo next varna modified hay to kar lo 

    this.password = await bcrypt.hash(this.password,10)
    next()
})

//ya ap apnay schema may .method dalo to ap methods bana saktay ho ham nay banaya isPasswordCorrect aus may time lagay ga to async function banaya aur await kia phir bcrypt ko bola compare karo password ko auper valay password say this.password say 

userSchema.methods.isPasswordCorrect = async function(password)
{
   return await bcrypt.compare(password,this.password)
}

//ak aur method add karin gay jo kay generate karay ga tokens ko aus ki expiry aur pass .env may hay 
userSchema.methods.generateAccessToken = function(){
    //ya ham nay package may github ka link tha vha say dakha kay sign may likhtay hain
    return JsonWebTokenError.sign(
        {
            _id: this._id,
            email: this.email,
            username:this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    //ya ais liay banaya Q kay ya bar bar refresh hota hay aur ais may info kam hoti hay usage agay dakhin gay next lectures may 
    return JsonWebTokenError.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)

