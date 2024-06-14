import express from "express";
import cors from 'cookie-parser'
import cookieParser from "cookie-parser";



const app = express()

app.use(cors({// app.use ka matlab hay kay configuration use kar rahay hain express kay use kar rahay hain 
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))


app.use(express.json({limit:'16kb'}))// aitna hi limit di hay 

//urlencoded use hota hay kay kabhi search pay url may google+api asa ata hay kabhi google_api asay ata hay to aus kay liay extended ais liay kay obj kay ander aur obj day do zada extended use nahi hota 
app.use(express.urlencoded({extended:true,limit:'16kb'}))

app.use(express.static('public'))
//static use hota hay kay koi file rakhvani ho to images,pdf public may ain gi files

//user kay browser kay cookies kay liay
app.use(cookieParser())



//routes import
import userRouter from './routes/user.routes.js'

//routes declearation

// phalay ham app.get kar kay route banatay thay lakin ab route ko alg folder dia hay to app.use agey aus ka name jaha say import kia hay 

app.use('/api/v1/users',userRouter)
//to ab confusion ho gaya kay ham nay bola hay /user pay jao aur ager userRouter dia hay vaha hay /register pay jay to kasay ho ga to ya kuch asa hota hay 

//ham nay bola /user pay jao jo kay userRouter pay lay ja raha hay vaha likha hay /register .phir method to hamara link asa banay ga   http://localhost:8000/api/v1/users/register   asi say ya ho ga kay ager phir ap ko login bhi banana hay to ham app.js may koi changing nahi karin gay vaha same code dain gay /login pay phir hamara link asa ho jay ga  http://localhost:8000/api/v1/users/login to clean rahay ga 


export {app}