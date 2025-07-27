const mongoose=require('mongoose')
const dotenv=require('dotenv')

dotenv.config()

const db=async()=>{
   const con=await mongoose.connect(process.env.MONGOURL)
   if(con){
    console.log("database connected")
   }
}

module.exports=db