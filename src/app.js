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

export {app}