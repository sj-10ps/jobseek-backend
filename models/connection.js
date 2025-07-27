const mongoose=require('mongoose')
const connectionSchema=new mongoose.Schema({
    userfollowing:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'login'
    },
    userFollowed:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'login'
    },
    followedat:{
        type:Date,
        default:Date.now()
    }
})

const connection=mongoose.model('connection',connectionSchema)

module.exports=connection