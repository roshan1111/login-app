const express = require("express");
 const session = require('express-session')
 const bodyParser = require("body-parser");
 const morgan = require("morgan");
 const { upload } = require("../middlewares/uploadImage");
 const { dev } = require("../config");
 const { isLoggedin, isLoggedout } = require("../middlewares/adminAuth");
 const adminRoute = express(); //app

 const {loadadminLogin, adminLogin, loadAdminHome, adminLogout, loadResetPasswords, resetPasswords, loadMailToken, updateToken, loadDashboard, loadAddUser,editUser, deleteUser, addUser, editUpdate} = require("../controllers/admin")

//for session
adminRoute.use(session({
    secret: dev.app.secret_key,
    resave: false,
    saveUninitialized: true,
   
  }))

  //display ejs views
adminRoute.set("views", "./views/admin");

  //these aree middleware receiving json data
adminRoute.use(bodyParser.json());
//receiving form data body it must be there
adminRoute.use(bodyParser.urlencoded({ extended: true }));
// shows the information on terminal
adminRoute.use(morgan("dev"))
//for static data from backend like image, css
adminRoute.use(express.static("public"))


//login admin route
adminRoute.get("/login",isLoggedout,  loadadminLogin)
//get data
adminRoute.post("/login", adminLogin)

//load home page
adminRoute.get("/home", isLoggedin, loadAdminHome)
//logout 
adminRoute.get("/logout",isLoggedin, adminLogout)
adminRoute.get("/reset-password", loadResetPasswords)
adminRoute.post("/reset-password", resetPasswords)
//get token clicked from email link to change password
adminRoute.get("/resetPassword",isLoggedout, loadMailToken)
adminRoute.post("/resetPassword", isLoggedout,updateToken)
adminRoute.get("/dashboard",isLoggedin, loadDashboard)

adminRoute.get("/addUser",isLoggedin,loadAddUser )
adminRoute.post("/addUser",upload.single("image"), addUser)


adminRoute.get("/editUser",isLoggedin,editUser )
adminRoute.post("/editUser",upload.single("image"),editUpdate )

adminRoute.get("/deleteUser",isLoggedin,deleteUser )













module.exports = adminRoute;