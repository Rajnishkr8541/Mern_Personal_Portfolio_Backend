import express from "express"; // Importing the Express framework
import {
  postTimeline,
  deleteTimeline,
  getAllTimeline,
} from "../controller/timelineController.js"; // Importing controller functions for timeline operations
import { isAuthenticated } from "../middlewares/auth.js"; // Importing authentication middleware

const router = express.Router(); // Creating a new router instance

// Route for adding a new timeline entry
router.post("/add", isAuthenticated, postTimeline);

// Route for deleting a specific timeline entry by ID
router.delete("/delete/:id", isAuthenticated, deleteTimeline);

// Route for retrieving all timeline entries
router.get("/getall", getAllTimeline);

// Exporting the router for use in other parts of the application
export default router;
