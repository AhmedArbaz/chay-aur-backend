import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


const connectDB = async ()=>{

    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
        //ya log karay ga mongodb kay connection ko jo ak obj ata hay ais ko dakh lana phar lana
        
    } catch (error) {
        console.log("MongoDB connection error",error);
        process.exit(1)// ya process node may ata hay kay ham throw error ya process ko exit kar kay bhi khatam kar saktay hain ais ko thora pharo phir aur samaj ay ga 
    }
}
export default connectDB