const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const { transporter } = require("./mailer");
const usermodel = require("../models/user");
const loginmodel = require("../models/Login");
const companymodel = require("../models/company");
const postmodel=require('../models/post')
const connectionmodel=require('../models/connection')
const messagemodel=require('../models/message')
const bcrypt = require("bcrypt");
const login = require("../models/Login");
const { route } = require("./User");

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "media/profile");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".jpg");
  },
});
const upload = multer({ storage: storage });



router.post("/userregister", upload.none(), async (req, res) => {
  const { password, firstname, lastname, email } = req.body;
 
  const existing = await loginmodel.findOne({ email: email });
  if (existing) {
   return res.json({ status: "user already exists" });
  } else {
    const hashedpassword = await bcrypt.hash(password, 10);
    const logindata = new loginmodel({
      email: email,
      password: hashedpassword,
      usertype: "user",
    });
    const logininstance = await logindata.save();
    const userdata = new usermodel({
      firstname: firstname,
      lastname: lastname,
      email: email,
      login: logininstance._id,
    });
    try {
      await userdata.save();
      return res.json({ status: "ok" });
    } catch (err) {
      return res.json({ status: err });
    }
  }
});

router.post("/companyregister", upload.single("logo"), async (req, res) => {
  const {
    password,
    name,
    email,
    phone,
    district,
    state,
    location,
    industry,
    website,
    linkedin,
    description,
  } = req.body;
  console.log(req.body)
 
  const logo = req.file ? req.file.filename : null;
  const existing = await loginmodel.findOne({ email:email });
  if (existing) {
    res.json({ status: "user already exists" });
  } else {
    const hashedpassword = await bcrypt.hash(password, 10);
    const logindata = new loginmodel({
      email: email,
      password: hashedpassword,
      usertype: "pending",
    });
    const logininstance = await logindata.save();
    const companydata = new companymodel({
      name: name,
      email: email,
      district: district,
      state: state,
      phone: phone,
      linkedin: linkedin,
      logo: logo,
      location: location,
      industry: industry,
      website: website,
      login: logininstance._id,
      status:'pending',
      description:description
    });

    await companydata.save();
    return res.json({ status: "ok" });
  }
});

router.post("/login", upload.none(), async (req, res) => {
  const { email, password } = req.body;
  const user = await loginmodel.findOne({ email: email });
  console.log(email,password)
  if (!user) {
    return res.json({ status: "User not found" });
  } else {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ status: "password mismatch" });
    } else {
      if (user.usertype == "user") {
        const userdata =await usermodel.findOne({ login: user._id });
     
        return res.json({
          status: "ok",
          usertype: user.usertype,
          userId: userdata._id,
          log_id:user._id
        });
      }else if(user.usertype == "company"){
         const companydata =await companymodel.findOne({ login: user._id });
        return res.json({
          status: "ok",
          usertype: user.usertype,
          userId: companydata._id,
          log_id:user._id
        });
      }else if(user.usertype==="admin"){
       
       
      
          return res.json({
          status: "ok",
          usertype: "admin",
          userId:user._id,
          log_id:user._id
        });

      

      }

     
        
      
    }
  }
});

router.post("/createadmin", upload.none(), async (req, res) => {
  const { email, password} = req.body;
  const logindata = new loginmodel({
    email: email,
    password: await bcrypt.hash(password, 10),
    usertype: "admin",
  });
  await logindata.save();
  return res.json({ status: "ok" });
});

router.post("/forgotpassword", upload.none(), async (req, res) => {
  const email = req.body.email;
  const existing = await loginmodel.findOne({ email: email ,usertype:{$in:["user","company"]}});
  if (!existing) {
    return res.json({ status: "email not registered" });
  }
  const token = jwt.sign({ userId: existing._id }, "sj", { expiresIn: "15m" });
  const resetlink = `http://localhost:3000/forgotpost/${token}`;
  await transporter.sendMail({
    from: "pssj8208@gmail.com",
    to: existing.email,
    subject: "Reset password",
    html: `<p>click <a href='${resetlink}'>here</a> to reset password'</p>`,
  });
  return res.json({ status: "email sent" });
});

router.post("/resetpass", upload.none(), async (req, res) => {
  const { password, token } = req.body;
  
  const decoded = jwt.verify(token, "sj");
  const user = await loginmodel.findById(decoded.userId);
  if (!user) return res.json({ status: "invalid user or session expired" });
  user.password = await bcrypt.hash(password, 10);
  user.save();
  return res.json({ status: "ok" });
});


router.post('/fetchallposts',async(req,res)=>{
  const data=await postmodel.aggregate([
    {
      $lookup:{
        from:'logins',
        localField:'user',
        foreignField:'_id',
        as:'logindetails'
      }
    },
      {$unwind:{path:'$logindetails',preserveNullAndEmptyArrays:true}},
    {
      $lookup:{
        from:'users',
        localField:'logindetails._id',  
        foreignField:'login',
        as:'userdetails'

      }
    },
    {$unwind:{path:'$userdetails',preserveNullAndEmptyArrays:true}},
    {
      $lookup:{
         from:'companies',
         localField:'logindetails._id',
         foreignField:'login',
         as:'companydetails'
      }
    },
     {$unwind:{path:'$companydetails',preserveNullAndEmptyArrays:true}},
      { $sort: { createdAt: -1 } }
   
  ])
  console.log(data)


  return res.json({data:data})
})

router.post('/fetchyourposts', async (req, res) => {
    const logid = req.body.logid;

    // Step 1: Get all users that this user follows
    const followingdata = await connectionmodel.find({ userFollowed: logid }).select('userfollowing');

    // Extract IDs into an array
    const followingIds = followingdata.map(f => f.userfollowing);

    // Step 2: Fetch posts from these users
    const postdata = await postmodel.aggregate([
        { $match: { user: { $in: followingIds } } }, // Match posts where user is in following list
        {
            $lookup: {
                from: 'logins',
                localField: 'user',
                foreignField: '_id',
                as: 'logindetails'
            }
        },
        { $unwind: "$logindetails" },
        {
            $lookup: {
                from: 'users',
                localField: 'logindetails._id',
                foreignField: 'login',
                as: 'userdetails'
            }
        },
        { $unwind: { path: '$userdetails', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'companies',
                localField: 'logindetails._id',
                foreignField: 'login',
                as: 'companydetails'
            }
        },
        { $unwind: { path: '$companydetails', preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } } 
    ]);
    
    res.json({ data: postdata });
});


  router.post('/messagespost', async (req, res) => {
    const { senderId, receiverId, text } = req.body;
    console.log(senderId,receiverId,text)
    try {
      const message = new messagemodel({ senderId, receiverId, text });
      await message.save();
      res.status(201).json({status:"ok"});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }

  });

  router.get('/messages/:senderId/:receiverId', async (req, res) => {
    const { senderId, receiverId } = req.params;
    try {
      const messages = await messagemodel.find({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      }).sort({ timestamp: 1 });
  
      res.json({data:messages});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

router.get('/fetchmessagesenders',async(req,res)=>{
  const userid=req.params.id
  const data=await messagemodel.aggregate([
    {$match:{receiverId:userid}},
    {
      $lookup:{
        from:'login',
        localField:'recieverId',
        foreignField:'_id',
        as:'logindetails'
      }
    },
    {$unwind:{path:"$logindetails",preserveNullAndEmptyArrays:true}},
    {
      $lookup:{
        from:'user',
        localField:'logindetails._id',
        foreignField:'login',
        as:'userdetails'
      }
    },
    {$unwind:{path:"$userdetails",preserveNullAndEmptyArrays:true}},
    {
      $lookup:{
        from:'company',
        localField:'logindetails._id',
        foreignField:'login',
        as:'companydetails'
      }
    },
    {$unwind:{path:"$logindetails",preserveNullAndEmptyArrays:true}},
    { $project: {
              _id: 0,
              type: { $arrayElemAt: ["$logindetails.usertype", 0] },
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
  ])
  return res.json({data:data})

})



  router.post('/fetchmessagingusers',async(req,res)=>{
    console.log("hawegfifuewgiufwgiufewgiuf")
    const logid=req.body.logid
    
    const following=await connectionmodel.find({userFollowed:logid})
    const followingids=following.map(per=>per.userfollowing)
    const messagesenders=await messagemodel.find({receiverId:logid})
    const messagesenderids=messagesenders.map(per=>per.senderId)

    const allmessagingusersids=[...new Set([
      ...messagesenderids,
      ...followingids
    ])]
    const allmessagingusers=await loginmodel.aggregate([
      {$match:{_id:{$in:allmessagingusersids}}},
      {
        $lookup:{
            from:'users',
            localField:'_id',
            foreignField:'login',
            as:'userdetails'
        }
      },
        {$unwind:{path:'$userdetails',preserveNullAndEmptyArrays:true}},
  {      
        $lookup:{
          from:'companies',
          localField:'_id',
          foreignField:'login',
          as:'companydetails'
        }},
        {$unwind:{path:'$companydetails',preserveNullAndEmptyArrays:true}}
    ])

    console.log("wdwdwd",allmessagingusers)

  return res.json({status:"ok",data:allmessagingusers})
    

  })



module.exports = router;
