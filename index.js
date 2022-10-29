const express = require("express");
const chalk = require("chalk")
const app = express()
const {dev} = require("./config");
const { clientError, serverError } = require("./controllers/error");
const userRoute = require("./routes/users");
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
//user router 
app.use(userRoute)
app.use(clientError)
app.use(serverError)