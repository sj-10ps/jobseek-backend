    const mongoose=require('mongoose')
    const certificationSchema=new mongoose.Schema({
        title:String,
        issued:String,
        issuedate:Date,
        credentialid:String,
        credentialurl:String,
        media:String,
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    })

    const certification=mongoose.model('certification',certificationSchema)
    module.exports=certification

