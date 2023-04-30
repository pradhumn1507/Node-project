const validator = require("validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const SECRETKEY = "jwt token";

const cleanupAndValidate = ({ email, username, name, password ,phone}) => {
  return new Promise((resolve, reject) => {
    if (!email || !username || !name || !password || !phone) {
      reject("Missing Credentials");
    }
    if (typeof name !== "string") reject("Invalid Name");
    if (typeof email !== "string") reject("Invalid Email");
    if (typeof username !== "string") reject("Invalid Username");
    if (typeof password !== "string") reject("Invalid Password");
    if (typeof phone !== "string") reject("Invalid Phone Number");

    if (username.length <= 2 || username.length > 50) {
      reject("username should be 3-50 charachters");
    }
    if (password.length <= 2 || username.password > 50) {
      reject("password should be 3-20 charachters");
    }

    if (!validator.isEmail(email)) {
      reject("Invalid Email Format");
    }
    if(phone.length !== 10) {
        reject("Invalid Phone Number")
    }
    resolve();
  });
};

const genrateJWTToken = (email) => {
    const token = jwt.sign(email, SECRETKEY);
    return token;
  };
  
  const sendVerificationToken = ({ email, token }) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      service: "Gmail",
      auth: {
        user: "kunalcharde1@gmail.com",
        pass: "wfarmidiswmhnrwd",
      },
    });
  
    const mailOptions = {
      from: "kunalcharde1@gmail.com",
      to: email,
      subject: "Email verification for Library Manegement System",
      html: `Click <a href='http://localhost:8000/api/${token}'>Here</a>`,
    };
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent successfully: " + info.response);
      }
    });
  
    return;
  };



  module.exports = { cleanupAndValidate, genrateJWTToken, sendVerificationToken };
