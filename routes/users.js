const express = require("express");
const session = require('express-session')

const { loadRegistration, postRegistration, loadLogin, loginUser, loadHome, logout, verifyEmail, loadVerificationEmail, resendVerificationEmail, loadResetPassword, resetPassword, loadToken, resetToken, loadEdit, editProfile,  } = require("../controllers/users");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { upload } = require("../middlewares/uploadImage");
const { dev } = require("../config");
const { isLoggedin, isLoggedout } = require("../middlewares/auth");
const userRoute = express(); //app


//for session
userRoute.use(session({
  secret: dev.app.secret_key,
  resave: false,
  saveUninitialized: true,
 
}))


//these aree middleware receiving json data
userRoute.use(bodyParser.json());
//receiving form data body it must be there
userRoute.use(bodyParser.urlencoded({ extended: true }));
// shows the information on terminal
userRoute.use(morgan("dev"))
//for static data from backend like image, css
userRoute.use(express.static("public"))

userRoute.get("/registration", isLoggedout, loadRegistration)

userRoute.post("/registration",upload.single("image"), postRegistration)
userRoute.get("/login",isLoggedout, loadLogin)
userRoute.post("/login", loginUser)
userRoute.get("/home", isLoggedin, loadHome)
userRoute.get("/logout", isLoggedin, logout)
userRoute.get("/verify", verifyEmail)
userRoute.get("/resendVerificationEmail",isLoggedout, loadVerificationEmail)
userRoute.post("/resendVerificationEmail",isLoggedout, resendVerificationEmail)
userRoute.get("/reset-password",isLoggedout, loadResetPassword)
userRoute.post("/reset-password",isLoggedout, resetPassword)
//reset password route and load view after clicking link from email
userRoute.get("/resetPassword",isLoggedout, loadToken)
//reset password route and get token from url
userRoute.post("/resetPassword",isLoggedout, resetToken)
//edit rout
userRoute.get("/edit", isLoggedin, loadEdit)
userRoute.post("/edit",upload.single("image"), editProfile)

//delete user 
// userRoute.get("/delete", isLoggedin, deleteUser )










//resendVerificationEmail






module.exports = userRoute;