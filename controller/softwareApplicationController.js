import catchAsyncErrors from "../middlewares/catchAsyncErrors.js"; // Middleware to handle async errors
import ErrorHandler from "../middlewares/error.js"; // Custom error handler
import {SoftwareApplication} from "../models/softwareApplicationSchema.js"; // Importing the SoftwareApplication model
import {v2 as cloudinary} from "cloudinary"; // Importing Cloudinary v2 for file upload

// Controller to add a new software application
export const addNewApplication = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Software Application icon Required!", 400)); // Error if no files are uploaded
    }
    
    const { svg } = req.files; // Extract the SVG file from the request
    const { name } = req.body; // Extract the software name from the request body

    if (!name) {
        return next(new ErrorHandler("Software's Name Required!", 400)); // Error if no name is provided
    }

    // Uploading the SVG to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(
        svg.tempFilePath, 
        { folder: "PORTFOLIO_SOFTWARE_APPLICATIONS" } // Folder to store the SVG in Cloudinary
    );
    
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary Errors"); // Log any Cloudinary error
    }

    // Create a new SoftwareApplication document in MongoDB
    const softwareApplication = await SoftwareApplication.create({
        name,
        svg: {
            public_id: cloudinaryResponse.public_id, // Cloudinary public ID for the uploaded file
            url: cloudinaryResponse.secure_url, // Secure URL of the uploaded SVG
        },
    });

    res.status(200).json({
        success: true,
        message: "New Software Application Added!", // Success response
        softwareApplication,
    });
});

// Controller to delete a software application
export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params; // Get the application ID from request params
    const softwareApplication = await SoftwareApplication.findById(id); // Find the software application by ID

    if (!softwareApplication) {
        return next(new ErrorHandler("Software Application not found!", 404)); // Error if application not found
    }

    const softwareApplicationSvgId = softwareApplication.svg.public_id; // Get the Cloudinary public ID for the SVG
    await cloudinary.uploader.destroy(softwareApplicationSvgId); // Delete the SVG from Cloudinary
    await softwareApplication.deleteOne(); // Delete the application from the database

    res.status(200).json({
        success: true,
        message: "Software Application Deleted!", // Success response for deletion
    });
});

// Controller to get all software applications
export const getAllApplication = catchAsyncErrors(async (req, res, next) => {
    const softwareApplications = await SoftwareApplication.find(); // Get all software applications from the database
    res.status(200).json({
        success: true,
        softwareApplications, // Return all software applications in the response
    });
});
