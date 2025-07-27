const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const usermodel = require("../models/user");
const loginmodel = require("../models/Login");
const companymodel = require("../models/company");
const bcrypt = require("bcrypt");

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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pssj8208@gmail.com",
    pass: "urfjjczzbgmmbdza",
  },
});

router.post("/userregister", upload.none(), async (req, res) => {
  const { password, firstname, lastname, email } = req.body;

  const existing = await loginmodel.findOne({ email: email });
  if (existing) {
    res.json({ status: "user already exists" });
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
  } = req.body;

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
    });

    await companydata.save();
    return res.json({ status: "ok" });
  }
});

router.post("/login", upload.none(), async (req, res) => {
  const { email, password } = req.body;

  const user = await loginmodel.findOne({ email: email });
  
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
      }
       return res.json({
          status: "ok",
          usertype: user.usertype,
          log_id:user._id
        });
      
    }
  }
});

router.post("/createadmin", upload.none(), async (req, res) => {
  const { username, password } = req.body;
  const logindata = new login({
    username: username,
    password: await bcrypt.hash(password, 10),
    usertype: "admin",
  });
  await logindata.save();
  return res.json({ status: "ok" });
});

router.post("/forgotpassword", upload.none(), async (req, res) => {
  const email = req.body.email;
  const existing = await login.findOne({ email: email });
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
  console.log(password);
  const decoded = jwt.verify(token, "sj");
  const user = await login.findById(decoded.userId);
  if (!user) return res.json({ status: "invalid user or session expired" });
  user.password = await bcrypt.hash(password, 10);
  user.save();
  return res.json({ status: "ok" });
});



module.exports = router;
