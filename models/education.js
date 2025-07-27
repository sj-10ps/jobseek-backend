const mongoose=require('mongoose')
const educationSchema=new mongoose.Schema({
    institute:String,
    field:String,
    degree:String,
    Startdate:Date,
    enddate:Date,
    extra:String,
    user:{
       type:mongoose.Schema.Types.ObjectId,
       ref:'user'
    }
    
})

const education=mongoose.model('education',educationSchema)
module.exports=education