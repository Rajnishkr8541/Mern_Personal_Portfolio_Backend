class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message); // Calls the parent `Error` class constructor to set the error message.
    this.statusCode = statusCode; // Adds a custom `statusCode` property to the error for HTTP response.
  }
}
// Custom Error class `ErrorHandler` that extends the built-in `Error` class, 
// allowing custom error messages and status codes to be used in the app.

export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  // Default error message if no message is set
  err.statusCode = err.statusCode || 500;
  // Default status code of 500 (Internal Server Error) if none is set

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }
  // Handles MongoDB duplicate key errors (code 11000), e.g., when inserting a record with a unique field that already exists.
  // Creates a custom error message showing the field with the duplicate value.

  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token Is Invalid, Try Again...`;
    err = new ErrorHandler(message, 400);
  }
  // Handles invalid JWT errors when the token is malformed.

  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token Is Expired, Try Login Again...`;
    err = new ErrorHandler(message, 400);
  }
  // Handles expired JWT tokens and asks the user to log in again.

  if (err.name === "CastError") {
    const message = `invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }
  // Handles invalid object IDs in MongoDB, typically when a malformed ID is passed to a route.

  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((error => error.message))
        .join(" ")
    : err.message;
  // This section extracts and concatenates error messages if `err.errors` exists, 
  // which typically happens during validation errors from Mongoose. Otherwise, it uses the main error message.

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
  // Sends the final error response to the client, including the appropriate status code and error message.
};

export default ErrorHandler;
// Exports the ErrorHandler class for use throughout the application.
