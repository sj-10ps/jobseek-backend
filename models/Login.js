const mongoose=require('mongoose')
const loginschema=new mongoose.Schema({
    email:String,
    password:String,
    usertype:String,
})

const login=mongoose.model('login',loginschema)
module.exports=login            