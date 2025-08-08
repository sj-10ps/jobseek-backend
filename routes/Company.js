const express=require('express')
const router=express.Router()
const companymodel=require('../models/company')
const jobmodel=require('../models/job')
const applicantmodel=require('../models/applicant')
const usermodel=require('../models/user')
const multer = require('multer')
const {transporter}=require('./mailer')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // folder where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // unique file name
  }
});

const upload = multer({ storage: storage });

router.post('/fetchcompanydetails',async(req,res)=>{
    const data=await companymodel.findById(req.body.companyid)
    console.log(data)
    return res.json({data:data})
})

router.post('/uploadjobdetails',upload.none(),async(req,res)=>{
     const skillsarray=JSON.parse(req.body.skills)
    const datatosave=new jobmodel({
        title:req.body.title,
        jobtype:req.body.jobtype,
        description:req.body.description,
        skills:skillsarray,
        responsibilities:req.body.responsibilities,
        salaryrange:req.body.salaryrange,
        experience:req.body.experience,
        company:req.body.comid,
        status:'open'
    })
    
    await datatosave.save()
    return res.json({status:"ok"})
})

router.post('/fetchjobsbyid',async(req,res)=>{
    const comid=req.body.comid
    const data=await jobmodel.find({company:comid})
    return res.json({data:data})    
})

router.post('/closejob',async(req,res)=>{
    const jobid=req.body.jobid
    await jobmodel.findByIdAndUpdate(jobid,{$set:{status:'closed'}})
    return res.json({status:"ok"})
})


router.post('/viewapplicantdetails',async(req,res)=>{
  const jobid=req.body.jobid
  console.log(jobid)
  const data=await applicantmodel.find({job:jobid,status:'pending'}).populate('resume').populate('user')
  console.log(data)
  return res.json({data:data})
})


router.post('/selectapplicants',async(req,res)=>{
  const choice=req.body.choice
  const applicantid=req.body.applicantid
  const applicantdata=await applicantmodel.findByIdAndUpdate(applicantid,{$set:{status:choice==="select"?'selected':'rejected'}},{new:true}).populate('user').populate('job')
  const username=`${applicantdata.user.firstname} ${applicantdata.user.lastname}`
  const usermail=applicantdata.user.email
  const jobtitle=applicantdata.job.title

  const jobdetails=await jobmodel.findById(applicantdata.job._id).populate('company')
  const companyemail=jobdetails.company.email
  const companyname=jobdetails.company.name

  if(choice==="select"){
    const mailoptions={
       from:`${companyname} ${companyemail}`,
       to:usermail,
       subject: `Congratulations! You have been selected for ${jobtitle}`,
        html: `
          <h2>Dear ${username},</h2>
          <p>Congratulations! You have been <b>selected</b> for the interview for the position of <b>${jobtitle}</b> at <b>${companyname}</b>.</p>
          <p>We will contact you soon with further details.</p>
          <br>
          <p>Best Regards,</p>
          <p>${companyname} Team</p>
        `,
    }
    await transporter.sendMail(mailoptions)
  }else{
   
      // ✅ Rejected email
      const mailOptions = {
        from: `"${companyname}" ${companyemail}`,
        to: usermail,
        subject: `Application Status for ${jobtitle}`,
        html: `
          <h2>Dear ${username},</h2>
          <p>Thank you for applying for <b>${jobtitle}</b> at <b>${companyname}</b>.</p>
          <p>We regret to inform you that you were not selected for this position.</p>
          <p>We appreciate your interest and encourage you to apply for future openings.</p>
          <br>
          <p>Best Regards,</p>
          <p>${companyname} Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
  }
  return res.json({status:"ok"})
})

router.post('/viewselectedapplicant',async(req,res)=>{
  const jobid=req.body.jobid
  const data=await applicantmodel.find({job:jobid,status:'selected'}).populate('user')
  return res.json({data:data})
})

router.post('/inviteforinterview',async(req,res)=>{
  const date=req.body.date
  const applicantid=req.body.applicantid
  const applicantdata=await applicantmodel.findByIdAndUpdate(applicantid,{$set:{status:'invited'}},{new:true}).populate('user').populate('job')
  const username=`${applicantdata.user.firstname} ${applicantdata.user.lastname}`
  const usermail=applicantdata.user.email
  const jobtitle=applicantdata.job.title

  const jobdetails=await jobmodel.findById(applicantdata.job._id).populate('company')
  const companyemail=jobdetails.company.email
  const companyname=jobdetails.company.name


    const mailoptions={
       from:`${companyname} ${companyemail}`,
       to:usermail,
       subject: `Congratulations! You have been invited for an interview for the ${jobtitle} in ${companyname}`,
        html: `
          <h2>Dear ${username},</h2>
          <p>Congratulations! Your interview for the position of <b>${jobtitle}</b> at <b>${companyname}</b> is scheduled  on ${date}.</p>
          <p>We will contact you soon with further details.</p>
          <br>
          <p>Best Regards,</p>
          <p>${companyname} Team</p>
        `,
    }
    
    await transporter.sendMail(mailoptions)
    return res.json({status:"ok"})

})


module.exports=router