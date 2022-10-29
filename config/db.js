const {dev} = require (".");
const mongoose = require("mongoose");

const connectDB = async()=>{
    try{
        await mongoose.connect(dev.db.url)
        console.log("db is connected")
    }
    catch(error){
        console.log("db not added");   

        console.log(error);  
        process.exit(1);

    }
}

module.exports = connectDB;  