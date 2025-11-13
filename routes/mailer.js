const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "smtp.gmail.com",
  port:465,
  secure:true,
  auth: {
    user: process.env.NODEMAILUSER,
    pass: process.env.NODEMAILPASS,
  },
});

module.exports = { transporter };