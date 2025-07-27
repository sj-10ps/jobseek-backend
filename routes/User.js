const express=require('express')
const router=express.Router()
const usermodel=require('../models/user')
const postmodel=require('../models/post')
const logmodel=require('../models/Login')
const companymodel=require('../models/company')
const commentmodel=require('../models/comment')
const certificationmodel=require('../models/certification')
const experiencemodel=require('../models/experience')
const educationmodel=require('../models/education')
const skillsmodel=require('../models/skills')
const multer=require('multer')
const { default: mongoose } = require('mongoose')
const comment = require('../models/comment')
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'media/post')
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+".jpg")
    }
})


const storageprofile=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'media/profile')
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+".jpg")
    }
})
const upload=multer({storage:storage})

const uploadprofile=multer({storage:storageprofile})
router.post('/fetchprofile',async(req,res)=>{
    const {userid}=req.body
    
    const userdata=await usermodel.findById(userid)
    console.log(userdata);
    
 
    if(userdata){
        
        return res.json({status:"ok",data:userdata})
    }else{
         return res.json({status:"failed"})
    }

})

router.post('/fetchpost',async(req,res)=>{
    const {userid}=req.body
    const postdata=await postmodel.find({user:userid}).sort({createdAt:-1})
    
    return res.json({status:"ok",data:postdata})
})

router.post('/uploadpost',upload.single('file'),async(req,res)=>{
    const file=req.file.filename
    const des=req.body.des
    const postdata=new postmodel({
        media:file,
        description:des,
        user:req.body.userid
    })
    try{
        await postdata.save()
        return res.json({status:'ok'})
    }catch(err){
        return res.json({status:'failed'})
    }

})

router.post('/updatelike',async(req,res)=>{
    const postid=req.body.postid
    const isliked=req.body.isliked
    const logid=req.body.logid
   
    const post=await postmodel.findById(postid)
    if(post.likedby.includes(logid)){
        res.json("already liked")
    }else{
        if(isliked){
            post.likes+=1
            post.likedby.push(logid)
        }else{
            post.likes-=1
            post.likedby=post.likedby.filter((id)=>id!==logid)
        }
        await post.save()
        return res.json({status:"ok"})
    }
   
    
})


router.post('/postcomment',upload.none(),async(req,res)=>{
    
    const logid=req.body.logid
    const comment=req.body.comment
    const postid=req.body.postid
    console.log(logid,comment,postid)
    const commentdata=new commentmodel({
        user:logid,
        comment:comment,
        post:postid
    })
    try{
      await commentdata.save()
      res.json({status:"ok"})
    }catch(err){
        res.json({status:"failed"})
    }
   
})

router.post('/fetchcomment', async (req, res) => {
  const postid = req.body.postid;   
  const data = await commentmodel.aggregate([
    {
      $match: { post:new mongoose.Types.ObjectId(postid) }
    },
    {
      $lookup: {
        from: 'user',
        localField: 'user',
        foreignField: 'login',
        as: 'userData'
      }
    },
    {
      $lookup: {
        from: 'company',
        localField: 'user',
        foreignField: 'login',
        as: 'companyData'
      }
    },
    {
      $addFields: {
        userData: { $arrayElemAt: ['$userData', 0] },
        companyData: { $arrayElemAt: ['$companyData', 0] },
        authorName: {
          $cond: {
            if: { $gt: [{ $ifNull: ['$userData', null] }, null] },
            then: '$userData.firstname',
            else: '$companyData.companyname'
          }
        }
      }
    },
    {
      $project: {
        comment: 1,
        authorName: 1,
        createdAt: 1
      }
    }
  ]);
 

  res.json({status:"ok",data:data});
});


router.post('/fetchdetails',async(req,res)=>{

    const userid=req.body.userid
    const profiledata=await usermodel.findById(userid)
    const certificatedata=await certificationmodel.find({user:userid})
    const educationdata=await educationmodel.find({user:userid})
    const experiencedata=await experiencemodel.find({user:userid})
    const skillsdata=await skillsmodel.find({user:userid})
 
  
    return res.json({status:'ok',profiledata:profiledata,certificatedata:certificatedata,educationdata:educationdata,experiencedata:experiencedata,skillsdata:skillsdata})
})


router.post('/profileUpdate',uploadprofile.single('image'),async(req,res)=>{
   const {
      firstname,
      lastname,
      email,
      age,
      gender,
      district,
      state,
      phone,
      linkedin,
      github,
      userid
    } = req.body;

    const image=req.file?req.file.filename:'pending'
     if(image==="pending"){
      const updated=await usermodel.findByIdAndUpdate(userid,{firstname:firstname,lastname:lastname,email:email,age:age,gender:gender,district:district,state:state,phone:phone,linkedin:linkedin,github:github})
     }else{
      await usermodel.findByIdAndUpdate(userid,{image:image})
     }
    
    res.json({status:"ok"})
  
})


module.exports=router 