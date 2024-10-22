import { Timeline } from "../models/timelineSchema.js"; // Importing the Timeline model
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js"; // Middleware to handle async errors
import ErrorHandler from "../middlewares/error.js"; // Custom error handler

// Controller to add a new timeline entry
export const postTimeline = catchAsyncErrors(async (req, res, next) => {
  const { title, description, from, to } = req.body; // Extracting timeline data from request body
  
  const newTimeline = await Timeline.create({
    title, // Title of the timeline
    description, // Description of the timeline
    timeline: { from, to }, // Time period (from and to dates)
  });

  res.status(200).json({
    success: true,
    message: "Timeline Added!", // Success response
    newTimeline, // Return the newly created timeline entry
  });
});

// Controller to delete a timeline entry
export const deleteTimeline = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params; // Get the timeline ID from request params
  
  const timeline = await Timeline.findById(id); // Find the timeline by ID
  if (!timeline) {
    return next(new ErrorHandler("Timeline Not Found!", 404)); // Error if timeline not found
  }

  await timeline.deleteOne(); // Delete the timeline from the database
  res.status(200).json({
    success: true,
    message: "Timeline Deleted!", // Success response after deletion
  });
});

// Controller to get all timeline entries
export const getAllTimeline = catchAsyncErrors(async (req, res, next) => {
    const timelines = await Timeline.find(); // Retrieve all timelines from the database
    res.status(200).json({
        success: true,
        timelines, // Return all timeline entries in the response
    });
});
