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
const resumemodel=require('../models/resume')
const connectionmodel=require('../models/connection')
const jobmodel=require('../models/job')
const applicantmodel=require('../models/applicant')
const multer=require('multer')
const { default: mongoose } = require('mongoose')
const comment = require('../models/comment')
const path=require('path')
const { type } = require('os')
const user = require('../models/user')
const job = require('../models/job')
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

const storagecertificate = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'media/certificate'); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
  
});






const storageresume=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'media/resume')
  },
  filename:(req,file,cb)=>{
    const ext=path.extname(file.originalname)
    cb(null,Date.now()+ext)
  } 
})



const upload=multer({storage:storage})

const uploadcertificate=multer({storage:storagecertificate})

const uploadprofile=multer({storage:storageprofile})
const uploadresume=multer({storage:storageresume})
router.post('/fetchprofile',async(req,res)=>{
    const {userid}=req.body
    
    const userdata=await usermodel.findById(userid)
  
    
 
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
   
        if(isliked){
            post.likes+=1
            post.likedby.push(logid)
        }else{
            post.likes-=1
            post.likedby=post.likedby.filter((id)=>id!==logid)
        }
        await post.save()
        return res.json({status:"ok"})
  
   
    
})


router.post('/postcomment',upload.none(),async(req,res)=>{
    
    const logid=req.body.logid
    const comment=req.body.comment
    const postid=req.body.postid
  
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
      $match: { post: new mongoose.Types.ObjectId(postid) }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: 'login',
        as: 'userData'
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'user',
        foreignField: 'login',
        as: 'companyData'
      }
    },
    {
      $project: {
        comment: 1,
        createdAt: 1,
        authorName: {
          $cond: {
            if: { $gt: [{ $size: '$userData' }, 0] },
            then: { $arrayElemAt: ['$userData.firstname', 0] },
            else: { $arrayElemAt: ['$companyData.name', 0] }
          }
        },
        authorImage:{
          $cond:{
            if:{$gt:[{$size:'$userData'},0]},
            then:{$arrayElemAt:['$userData.image',0]},
            else:{$arrayElemAt:['$companyData.logo',0]}
          }
        }
      }
    }

  ]);



  res.json({ status: "ok", data: data });
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
      professionaltitle,
      summary,
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
      const updated=await usermodel.findByIdAndUpdate(userid,{firstname:firstname,lastname:lastname,email:email,professionaltitle:professionaltitle,summary:summary,age:age,gender:gender,district:district,state:state,phone:phone,linkedin:linkedin,github:github})
     }else{
      await usermodel.findByIdAndUpdate(userid,{image:image})
     }
    
    res.json({status:"ok"})
  
})


router.post('/uploadeducationdetails',upload.none(),async(req,res)=>{
  const {institute,field,degree,extra,startdate,enddate,userid} =req.body
  const datatosave=new educationmodel({
    institute:institute,
   field: field,
   degree: degree,
   startdate:startdate,
    enddate:enddate,
    extra:extra,
    user:userid
  })
  try{
    await datatosave.save()
    return res.json({status:"ok"})
  }catch{
      return res.json({status:"failed"})
  }
})


router.post('/uploadexperiencedetails',upload.none(),(req,res)=>{
  const {company,role,startdate,enddate,location,description,userid}=req.body
  const datatosave=new experiencemodel({
    company:company,
    role:role,
    startdate:startdate,
    enddate:enddate,
    location:location,
    description:description,
    user:userid,
  })
  try{
  datatosave.save()
  return res.json({status:"ok"})
}catch{
  return res.json({status:"failed"})
}
})


router.post('/uploadskills', upload.none(), async (req, res) => {
  const { skill,proficiency, userid } = req.body;

  const datatosave = new skillsmodel({
    skill: skill,
    level:proficiency,
    user: userid,
  });

  try {
    await datatosave.save();
    return res.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    return res.json({ status: "failed" });
  }
});

router.post('/certification',uploadcertificate.single('media') ,async (req, res) => {

  try {
    const cert = new certificationmodel({
      title:req.body.title,
      user:req.body.userid,
      issued:req.body.issued,
      issuedate:req.body.issuedate,
      credentialid:req.body.credentialid,
      credentialurl:req.body.credentialurl,
      media:req.file.filename
    });
    const saved = await cert.save();
    res.status(200).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.post('/uploadresume',uploadresume.single('resume'),async(req,res)=>{

 const existing=await resumemodel.findOne({user:req.body.userid,templateType:'default'})
 if(existing){
  const id=existing._id
  const data=await resumemodel.findByIdAndUpdate(id,{$set:{generatedPdf:req.file.filename}})
  return res.json({status:"ok",filename:data.generatedPdf})
 }else{
 const datatosave= new resumemodel({
    user:req.body.userid,
    templateType:'default',
    generatedPdf:req.file.filename
  })
  const data=await datatosave.save()
  return res.json({status:"ok",filename:data.generatedPdf})
 }

  
})


router.post('/fetchresume',uploadresume.none(),async(req,res)=>{
  const data=await resumemodel.findOne({user:req.body.userid,templateType:'default'})
  if(!data){
     return res.json({data:'',id:''})
  } 
  return res.json({data:data.generatedPdf,id:data._id})
})

router.post('/deleteselectedrecord',upload.none(),async(req,res)=>{
  const id=req.body.id
  const type=req.body.type

  if(type==="skill"){
    await skillsmodel.findByIdAndDelete(id)
  }else if(type==="education"){
    await educationmodel.findByIdAndDelete(id)
  }else if(type==="certificate"){
    await certificationmodel.findByIdAndDelete(id)
  }else if(type==="experience"){
    await experiencemodel.findByIdAndDelete(id)
  }else{
    await resumemodel.findByIdAndDelete(id)
  }
  return res.json({status:"ok"})
  
})


router.post('/uploadcustomresume',uploadresume.single('pdf'),async(req,res)=>{
 
  const pdf=req.file.filename
  const userid=req.body.userid
 
  const existing=await resumemodel.findOne({user:userid,templateType:'custom'})
  if(!existing){
      const datatosave=new resumemodel({
    user:userid,
    templateType:'custom',
    generatedPdf:pdf,
  })
  await datatosave.save()
  return res.json({status:"ok"})
  }else{
    await resumemodel.findOneAndUpdate({user:userid,templateType:'custom'},{$set:{generatedPdf:req.file.filename}})
    return res.json({status:"ok"})
  }

})

router.post('/fetchcustomresume',upload.none(),async(req,res)=>{
  const userid=req.body.userid
  const resumedata=await resumemodel.findOne({user:userid,templateType:'custom'})
   console.log(resumedata)
  return res.json({data:resumedata})
})

router.post('/fetchusercompanies',upload.none(),async(req,res)=>{
  const query=req.body.query
  
  const userdata=await usermodel.find({firstname:{$regex:'^'+query,$options:'i'}}).limit(10)
  const companydata=await companymodel.find({name:{$regex:'^'+query,$options:'i'},status:'approved'}).limit(10)

  const formatteduser=userdata.map(user=>({
    type:'user',
    id:user._id,
    name:user.firstname+' '+user.lastname||'',
    ...user._doc  

  }))
  
    const formattedcompany=companydata.map(com=>({
    type:'company',
    id:com._id,
    ...com._doc
  }))

   const combineddata=[...formatteduser,...formattedcompany   ]



  return res.json({data:combineddata})

})


router.post('/fetchallusercompanies',upload.none(),async(req,res)=>{
  const query=req.body.query
   const userdata=await usermodel.find({firstname:{$regex:'^'+query,$options:'i'}})
  const companydata=await companymodel.find({name:{$regex:'^'+query,$options:'i'},status:"approved"})

  const formatteduser=userdata.map(user=>({
    type:'user',
    id:user._id,
    name:user.firstname+' '+user.lastname||'',
    ...user._doc 

  }))

  const formattedcompany=companydata.map(com=>({
    type:'company',
    id:com._id,
    ...com._doc
  }))

  
   const combineddata=[...formatteduser,...formattedcompany]

    return res.json({data:combineddata})    
})


router.post('/managefollowing',async(req,res)=>{
 
  const followingid=req.body.followingid
  const followerid=req.body.followerid
  const existing=await connectionmodel.findOne({   userFollowed: followerid,
      userfollowing: followingid})
  if(existing){
    await connectionmodel.findByIdAndDelete(existing._id)
    return res.json({status:'unfollowed'})
  }else{
    const datatosave=new connectionmodel({
       userFollowed: followerid,   
    userfollowing: followingid   
    })
    await datatosave.save()
     return res.json({status:'followed'})
  }
})


router.post('/checkfollowstatus',async(req,res)=>{
  const followingid=req.body.followingid
  const followerid=req.body.followerid
   console.log(followerid,followingid)
  const existing=await connectionmodel.findOne({userFollowed : followerid ,
userfollowing :followingid  })
    console.log(existing)
  
  if(existing){
    return res.json({data:existing})
  }else{
     return res.json({data:null})
  }
})




router.post('/checkfollowstatusall',async(req,res)=>{

  const followerid=req.body.followerid
  const existing=await connectionmodel.find({userFollowed : followerid })
  
  
    return res.json({data:existing})
 
})



router.post('/followingfollowercount', async (req, res) => {
  try {
    const logid = req.body.logid;

    const followercount = await connectionmodel.countDocuments({ userfollowing: logid });
    const followingcount = await connectionmodel.countDocuments({ userFollowed: logid });

    const aggregatePipeline = (matchField, lookupField) => [
      { $match: { [matchField]: new mongoose.Types.ObjectId(logid) } },
      {
        $lookup: {
          from: 'logins',
          localField: lookupField,
          foreignField: '_id',
          as: 'logindetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: lookupField,
          foreignField: 'login',
          as: 'userdetails'
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: lookupField,
          foreignField: 'login',
          as: 'companydetails'
        }
      },
      {
        $project: {
          _id: 0,
          type: { $arrayElemAt: ["$logindetails.usertype", 0] },
            connectionId: "$_id",
          data: {
            $cond: [
              { $eq: [{ $arrayElemAt: ["$logindetails.usertype", 0] }, "user"] },
              {
                id: { $arrayElemAt: ["$userdetails._id", 0] },
                firstname:{$concat:[
                  { $arrayElemAt: ["$userdetails.firstname", 0] } ,
                  " ",
                  { $arrayElemAt: ["$userdetails.lastname", 0] }
                ]},
                image: { $arrayElemAt: ["$userdetails.image", 0] },
                logid: { $arrayElemAt: ["$userdetails.login", 0] }
              
              },
              {
                id: { $arrayElemAt: ["$companydetails._id", 0] },
                name: { $arrayElemAt: ["$companydetails.name", 0] },
                logo: { $arrayElemAt: ["$companydetails.logo", 0] },
                logid: { $arrayElemAt: ["$companydetails.login", 0] }
                
              }
            ]
          }
        }
      }
    ];

    const followerdata = await connectionmodel.aggregate(aggregatePipeline('userfollowing', 'userFollowed'));
    const followingdata = await connectionmodel.aggregate(aggregatePipeline('userFollowed', 'userfollowing'));
    
  

    return res.json({
      followercount,
      followingcount,
      followerdata,
      followingdata
    });

  } catch (error) {
    console.error('Error in /followingfollowercount:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.get('/fetchalljobs',async(req,res)=>{
   
   const data=await jobmodel.find({status:'open'}).populate('company').exec()
  
  return res.json({data:data})

})


router.post('/applyforjob',async(req,res)=>{
  const type=req.body.type
  
  let resumedata
  if(type==="default"){
  resumedata=await resumemodel.findOne({user:req.body.userid,templateType:'default'})
  }else{
    resumedata=await resumemodel.findOne({user:req.body.userid,templateType:'custom'})
  }


  const datatosave=new applicantmodel({
    job:req.body.jobid,
    user:req.body.userid,
    status:'pending',
    resume:resumedata._id
     
  })
  await datatosave.save();
  await jobmodel.findByIdAndUpdate(req.body.jobid,{$inc:{applicantscount:1}})
 
  return res.json({status:'ok'})
})


router.post('/appliedjobs',async(req,res)=>{
  const data=await applicantmodel.find({user:req.body.userid}).populate({path:'job',populate:'company'})
 
  return res.json({data:data})
})

router.post('/fetchpreferredjob',async(req,res)=>{
  const userskillsdocs=await skillsmodel.find({user:req.body.userid})
  const userskills=userskillsdocs.map(skilldata=>skilldata.skill)
  const minmatch=3
    const jobs = await jobmodel.aggregate([
      {
        $addFields: {
          matchedSkills: { $setIntersection: ["$skills", userskills] }
        }
      },
      {
    $match: {
      $expr: {
        $or: [
          { $gte: [{ $size: "$matchedSkills" }, minmatch] },          // case 1
          { $eq: [{ $size: "$matchedSkills" }, {$size:"$skills"}] }   // case 2
        ]
      }
    }
  },
      {
        $lookup: {
          from: "companies",         
          localField: "company",      
          foreignField: "_id",
          as: "company"
        }
      },
      { $unwind: "$company" } 
    ]);
 

  res.json({data:jobs})
  
    


})




module.exports=router 