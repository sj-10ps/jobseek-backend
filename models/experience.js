const mongoose=require('mongoose')
const experienceShema=new mongoose.Schema({
    company:String,
    role:String,
    startdate:Date,
    enddate:Date,
    location:String,
    description:String,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }
})

const experience=mongoose.model('experience',experienceShema)
module.exports=experience