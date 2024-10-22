import mongoose from "mongoose";

// Function to connect to MongoDB
const dbConnection = () => {
  mongoose.connect(process.env.MONGO_URI, {
    dbName: "PORTFOLIO", // Specifies the name of the database
  })
    .then(() => {
      console.log(`Database Connected`); // Successful connection log
    })
    .catch((error) => {
      console.log(`Error occurred from DB ${error}`); // Log any connection error
    });
};

export default dbConnection;
