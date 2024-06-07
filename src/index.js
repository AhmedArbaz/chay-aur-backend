// require ('dotenv').config({path:'./env'})

// ya ais liay kia kay ham chatay hain kay jasay hi file load ho sab say phalay hamary env variables aviable ho jayin file ko ab ais may import kay liay require ko use kia hay jo code ki consistancey kharab kar rhaa hay to ham import karin gay dotenv ko phir nichay ais ko config kar lain ga 

import dotenv from 'dotenv'

import mongoose from "mongoose";
import {DB_NAME} from "./constant.js";
import connectDB from "./db/index.js";

dotenv.config({
    path:"./env"
})
//ab ham nay require ki jaga import ko use kar to lia lakin asay thori kam chalay ga to hmin .joson may ja kay script may -r dotenv/config --experimental-json-modules src/index.js

//ais say ya ho ga kay ham bolin gay experimental pay use kar rahay hian 





// 2nd approach
//db may index.js file bani vaha connection ka code likha aur aus ko export kara ab yaha import karay gay 

connectDB()






/*

1st approach to connect mongodb
In index file by using efiy function also use trycatch and make efiy function as an async function

import express from "express";

//yaha index file may hi express ko dal dia 
const app = express()


// Ya ham nay ifi function hay jis ka kam hota hay foran execute karo ais may ()() asay 2 parantheses laga kay arrow function dalo 
;(  async ()=>{
try {
    // try catch use karna ak achi practice hay 
   await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`) 
   
   //yaha app.on use kia hay ager express responce na karay ya connect na ho to ya error dikhay 
   app.on('error',(error)=>{
    console.log("ERROR",error);
    throw error
   })
   
   app.listen(process.env.PORT,()=>{
    console.log(`App is listening on port ${process.env.PORT} `);
   })
} catch (error) {
    console.error("Error",error)
    throw error
}
})()

*/