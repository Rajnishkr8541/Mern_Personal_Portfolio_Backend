import express from "express"; // Importing Express framework
import { getAllMessages, sendMessage, deleteMessage } from "../controller/messageController.js"; // Importing message controller functions
import { isAuthenticated } from "../middlewares/auth.js"; // Importing authentication middleware

const router = express.Router(); // Creating a new router instance

// Route for sending a message
router.post("/send", sendMessage);

// Route for retrieving all messages
router.get("/getall", getAllMessages);

// Route for deleting a specific message by ID
// isAuthenticated middleware checks if the user is authenticated before deleting
router.delete("/delete/:id", isAuthenticated, deleteMessage);

// Exporting the router to use in other parts of the application
export default router;
