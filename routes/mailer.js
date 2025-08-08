const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pssj8208@gmail.com",
    pass: process.env.NODEMAILPASS,
  },
});

module.exports = { transporter };