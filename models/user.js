const mongoose=require('mongoose')


const userSchema=new mongoose.Schema({
firstname:String,
lastname:String,
email:String,
age:{
    type:String,
    default:null
},
gender:{
    type:String,
    default:null
},
district:{
    type:String,
    default:null
},
state:{
    type:String,
    default:null
},
phone:{
    type:String,
    default:null
},
image:{
    type:String,
    default:'',
},
linkedin:{
    type:String,
    default:null
},
github:{
    type:String,
    default:null
},
createdat:{
    type:Date,
    default:Date.now()
},
login:{
  type:mongoose.Schema.Types.ObjectId,
  ref:'login'
}

})

const user=mongoose.model('user',userSchema)
module.exports=user