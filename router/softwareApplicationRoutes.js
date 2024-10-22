import express from "express"; // Importing the Express framework
import {
  addNewApplication,
  deleteApplication,
  getAllApplication,
} from "../controller/softwareApplicationController.js"; // Importing controller functions for software applications
import { isAuthenticated } from "../middlewares/auth.js"; // Importing authentication middleware

const router = express.Router(); // Creating a new router instance

// Route for adding a new software application
router.post("/add", isAuthenticated, addNewApplication);

// Route for deleting a specific software application by ID
router.delete("/delete/:id", isAuthenticated, deleteApplication);

// Route for retrieving all software applications
router.get("/getall", getAllApplication);

// Exporting the router for use in other parts of the application
export default router;
