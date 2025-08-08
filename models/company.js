const mongoose=require('mongoose')


const companySchema=new mongoose.Schema({
name:String,
email:String,
phone:String,
district:String,
state:String,
location:String,
industry:String,
website:{
    type:String,
    default:null
},
logo:String,
linkedin:{
    type:String,
    default:null
},

registeredat:{
    type:Date,
    default:Date.now()
},
approvedat:{
    type:Date,
    default:null
},
updatedat:{
    type:Date,
    default:Date.now()
},
login:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'login'
},
status:{
   type:String,
   default:'pending'
},
description:{
    type:String,
    default:null
}
    
})

const company=mongoose.model('company',companySchema)
module.exports=company