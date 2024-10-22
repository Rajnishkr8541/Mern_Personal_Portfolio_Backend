import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema({
    title: {
        type: String,
        required:[true, "Title Required!"],
    },
    description: {
        type: String,
        required:[true, "Description Required!"],
    },
    timeline: {
        from: {
          type: String,
          required: [true, "Start date is Required!"],  
        },
        to: String,
    }
    
});

export const Timeline= mongoose.model("Timeline",timelineSchema);


