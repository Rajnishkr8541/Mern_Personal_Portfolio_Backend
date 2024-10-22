import mongoose from "mongoose"; // Importing Mongoose library

// Defining the software application schema
const softwareApplicationSchema = new mongoose.Schema({
    name: String, // Name of the software application
    svg: { // Object to hold SVG image information
        public_id: {
            type: String,
            required: true, // Ensures that public_id must be provided
        },
        url: {
            type: String,
            required: true, // Ensures that url must be provided
        },
    },
});

// Exporting the SoftwareApplication model for use in other parts of the application
export const SoftwareApplication = mongoose.model("SoftwareApplication", softwareApplicationSchema);
