const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILUSER,
    pass: process.env.NODEMAILPASS,
  },
});

module.exports = { transporter };