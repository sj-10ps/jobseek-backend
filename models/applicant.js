
const mongoose=require('mongoose')
const applicantSchema=new mongoose.Schema({
job:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'job'
},
user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
},
status:String,
appliedat:{
    type:Date,
    default:Date.now()
},
resume:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'resume'
}
})

const applicant=mongoose.model('applicant',applicantSchema)

module.exports=applicant