export const generateToken = (user, message, statusCode, res) => {
  // Generate a JWT using the user's method
  const token = user.generateJsonWebToken();

  // Set the token in a cookie and send the response
  res.status(statusCode).cookie("token", token, {
    // Set the expiration date of the cookie
    expire: new Date(
      Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000 // Cookie expiration time in milliseconds
    ),
    // Set cookie to be HTTP only to help prevent XSS attacks
    httpOnly: true
  }).json({
    success: true, // Indicate success
    message,       // Provide a message (e.g., "Login successful")
    token,         // Send the generated token in the response
    user,          // Send user information in the response
  });
};
