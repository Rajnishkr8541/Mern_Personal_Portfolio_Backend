import catchAsyncErrors from "../middlewares/catchAsyncErrors.js"; // Middleware to catch async errors
import ErrorHandler from "../middlewares/error.js"; // Custom error handler class
import {Message} from "../models/messageSchema.js"; // Importing the Message model from messageSchema

// Controller to handle sending a message
export const sendMessage = catchAsyncErrors(async (req, res, next) => {
    const { senderName, subject, message } = req.body; // Destructuring values from request body
    if (!senderName || !subject || !message) {
        return next(new ErrorHandler("Please fill full form!", 400)); // If any field is missing, throw a validation error
    }

    // Create a new message in the database
    const data = await Message.create({ senderName, subject, message }); 
        res.status(200).json({
        success: true,
        message: "Message Sent", 
        
        data,
    });
});

// Controller to get all messages
export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
    const message = await Message.find(); // Retrieve all messages from the database
    res.status(200).json({
        success: true,
        message, // Send success response with all messages
    });
});

// Controller to delete a message
export const deleteMessage = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params; // Destructure message ID from request params
    const message = await Message.findById(id); // Find message by ID
    if (!message) {
        return next(new ErrorHandler("Message Already deleted", 400)); // If message not found, throw an error
    }
    await message.deleteOne(); // Delete the message from the database
    res.status(200).json({
        success: true,
        message: "Message deleted", // Send success response after deletion
    });
});
