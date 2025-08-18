const express=require('express')
const router=express.Router()
const userModel=require('../models/user')
const companymodel=require('../models/company')
const loginmodel=require('../models/Login')
const feedbackmodel=require('../models/feedback')
const { transporter } = require("./mailer");

router.get('/getallusers',async(req,res)=>{
    const data=await userModel.find().sort({createdat:-1})
    console.log(data)
    return res.json(data)
})


router.post('/deleteuser',async(req,res)=>{
    await userModel.findByIdAndDelete(req.body.userid)
    return res.json({status:"ok"})
})

router.get('/getallcompanies',async(req,res)=>{
    const data=await companymodel.find({status:'approved'})
   
    return res.json(data)
})

router.post('/deletecompany',async(req,res)=>{
    await companymodel.findByIdAndDelete(req.body.comid)
    return res.json({status:"ok"})
})


router.get('/getpendingcompanies',async(req,res)=>{
    const data=await companymodel.find({status:'pending'}).sort({registeredat:-1})
    return res.json(data)
})

router.post('/approvecompany',async(req,res)=>{
    const companyinstance=await companymodel.findByIdAndUpdate(req.body.comid,{$set:{status:'approved',approvedat:Date.now()}})
    await loginmodel.findByIdAndUpdate(companyinstance.login,{$set:{usertype:'company'}})
    const link=`http://localhost:3000/login`
    await transporter.sendMail({
        from:'Jobseek <no-reply@jobseek.com>',
        to:companyinstance.email,
        subject:'registration approval',
        html:`<p>Your Registration Have Been Approved You Can Now login With Your credentials</p>
        <p>${link}</p>`
    })
    return res.json({status:"ok"})
})


   router.get('/viewfeedback',async(req,res)=>{
    const data=await feedbackmodel.find().sort({createdAt:-1}).populate('sender')    
    return res.json({status:"ok",data:data})
  })

  router.post('/replyfeedback',async(req,res)=>{
    const reply=req.body.reply
    const fbid=req.body.fbid
    const email=req.body.email
    await transporter.sendMail({
        from:'Jobseek <no-reply@jobseek.com>',
        to:email,
        subject:'Reply to your feedback',
        html:`Thank you for your valuable feedback,
        ${reply}
        `
    })
    await feedbackmodel.findByIdAndDelete(fbid)
    return res.json({status:"ok"})
  })

  
module.exports=router