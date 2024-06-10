import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
videoFile:{
    type:String, //cloudinary url
    required:true,
},

thumbnail:{
    type:String, 
    required:true,
},
title:{
    type:String, 
    required:true,
},
description:{
    type:String, 
    required:true,
},
duration:{
    type:Number, 
    required:true,
},
views:{
    type:Number,
    default:0,
},
isPublished:{
    type:Boolean,
    default:true,
},
owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
}




},{timestamps})


//ya hamin allow karta hay aggrigation quires likhnay kay liay true power ais say ati hay mongoos say 
videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema) 
//ais ko user may ref kar kay use kia hay to vaha Video likha tha to yaha same name likho