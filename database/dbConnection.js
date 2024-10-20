import mongoose from "mongoose";

const dbConnection = ()=>{

    mongoose.connect(process.env.MONGO_URI, {
        dbName:"PORTFOLIO"
    }).then(()=>{
        console.log(`Database Connected`);
        
    }).catch((error)=>{
        console.log(`Error occured from DB ${error}`);
        
    });

};

export default dbConnection;
