//"use strict";
const nodemailer = require("nodemailer");
const { dev } = require("../config");

exports.sendVerificationEmail = async (name, email, id) => {
  try {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: dev.app.authEmail, // generated ethereal user
        pass: dev.app.authPassword, // generated ethereal password
      },
    });

    const mailOptions = {
      from: dev.app.authEmail, // sender address
      to: email, // list of receivers
      subject: "Verification Email ✔", // Subject line
      html: `<p> Welcome ${name} !!! Please click the link to verify <a href = "http://localhost:3003/verify?id=${id}"> Verify Here </a> </p>`, // html body
    };

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Message sent: %s", info.response);
      }
    });
  } catch (error) {
   console.log(error)
  }
};
