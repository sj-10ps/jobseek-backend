const express=require('express')
const router=express.Router()
const userModel=require('../models/user')
const companymodel=require('../models/company')
const loginmodel=require('../models/Login')


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
    return res.json({status:"ok"})
})
module.exports=router