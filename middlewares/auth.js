import {User} from "../models/userSchema.js"; // Importing the User model to access user data from MongoDB.
import catchAsyncErrors from "./catchAsyncErrors.js"; // Middleware to handle errors in asynchronous functions without try/catch.
import ErrorHandler from "./error.js"; // Error handler class to throw custom errors.
import jwt from "jsonwebtoken"; // Importing JWT for token verification.

export const isAuthenticated = catchAsyncErrors(async(req, res, next) => {
    const {token} = req.cookies; 
    // Extracting the token from cookies, which contains the user's session/token information.

    if(!token){
        return next (new ErrorHandler("User Not Authenticated!", 400));
        // If no token is present, an error is thrown indicating the user is not authenticated.
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); 
    // Verifies the token using the JWT secret key. If the token is valid, it decodes and returns the payload (e.g., user ID).

    req.user = await User.findById(decoded.id); 
    // The decoded token contains the user ID. This line fetches the user from the database using the decoded ID and assigns it to the request object (`req.user`).

    next(); 
    // If the user is authenticated, the middleware allows the request to proceed to the next handler.
});
