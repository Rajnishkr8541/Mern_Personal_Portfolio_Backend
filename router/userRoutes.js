import express from "express"; // Importing the Express framework
import {
  login,
  logout,
  register,
  getUser,
  updateProfile,
  updatePassword,
  getUserForPortfolio,
  forgotPassword,
  resetPassword,
} from "../controller/userController.js"; // Importing controller functions for user operations
import { isAuthenticated } from "../middlewares/auth.js"; // Importing authentication middleware

const router = express.Router(); // Creating a new router instance

// Route for user registration
router.post("/register", register);

// Route for user login
router.post("/login", login);

// Route for user logout (requires authentication)
router.get("/logout", isAuthenticated, logout);

// Route for getting the current user's profile (requires authentication)
router.get("/me", isAuthenticated, getUser);

// Route for updating the user's profile (requires authentication)
router.put("/update/me", isAuthenticated, updateProfile);

// Route for updating the user's password (requires authentication)
router.put("/update/password", isAuthenticated, updatePassword);

// Route for getting the user's portfolio (does not require authentication)
router.get("/me/portfolio", getUserForPortfolio);

// Route for requesting a password reset
router.post("/password/forgot", forgotPassword);

// Route for resetting the password using a token
router.put("/password/reset/:token", resetPassword);

// Exporting the router for use in other parts of the application
export default router;
