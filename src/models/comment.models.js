import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// ya mongooseAggregatePaginate ais liay use kia hay kay ham kam videos ak page pay dikhain gay phir aur ya load kary ya next page pay jay ais liay 

const commentSchema = new Schema({
    content:{
        type:String,
        required:true,

    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video",
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
},{timestamps:true})

//ya hamin allow karta hay aggrigation quires likhnay kay liay true power ais say ati hay mongoos say 
commentSchema.plugin(mongooseAggregatePaginate)
// ya same video scheema say copy kia agrigation vala 

export const Comment = mongoose.model("Comment",commentSchema)