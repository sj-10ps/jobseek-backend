const mongoose=require('mongoose')
const feedbackschema=new mongoose.Schema({
    feedback:String,
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'login'
    }
},{timestamps:true})

const feedback=mongoose.model("feedback",feedbackschema)
module.exports=feedback