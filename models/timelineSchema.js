import mongoose from "mongoose"; // Importing the Mongoose library

// Defining the timeline schema
const timelineSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title Required!"], // Title is required with a custom error message
    },
    description: {
        type: String,
        required: [true, "Description Required!"], // Description is required with a custom error message
    },
    timeline: {
        from: {
          type: String,
          required: [true, "Start date is Required!"], // Start date is required with a custom error message
        },
        to: String, // End date is optional
    }
});

// Exporting the Timeline model for use in other parts of the application
export const Timeline = mongoose.model("Timeline", timelineSchema);
