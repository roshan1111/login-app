const express = require("express");
const chalk = require("chalk")
const app = express()
const {dev} = require("./config");
const { clientError, serverError } = require("./controllers/error");
const userRoute = require("./routes/users");
const adminRoute = require("./routes/admin")
const connectDB = require("./config/db");



const PORT = dev.app.port

//display ejs views
app.set("view engine", "ejs");



app.listen(PORT, async()=>{
    console.log(chalk.blue(`the serever is running at http://localhost:${PORT} `));
    await connectDB()
})


//test route
app.get("/test",(req,res)=>{
    res.send("test route is working")
});

//render the views
app.get("/views",(req, res)=>{
    res.render("index")
})

app.get("/", (req,res)=>{
    res.send("<h1>welcome to user managenent app click here to login</h1> <a href = /login >please login</a>");

})
//user router 
app.use(userRoute)
//admin route
app.use("/admin", adminRoute)
app.use(clientError)
app.use(serverError)