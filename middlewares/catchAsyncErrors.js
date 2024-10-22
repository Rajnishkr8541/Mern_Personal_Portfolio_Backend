const catchAsyncErrors = (thefunction) => {
  return (req, res, next) => {
    Promise.resolve(thefunction(req, res, next)).catch(next);
    // Executes the provided function (`thefunction`) with `req`, `res`, and `next` parameters.
    // Wraps the function in a `Promise.resolve` to ensure it's handled as a promise, whether it's asynchronous or not.
    // If the function throws an error (rejected promise), `.catch(next)` passes the error to the next middleware (typically an error handler).
  };
};

export default catchAsyncErrors; 
// Exports the function for use in other files. It acts as a middleware wrapper for error handling in asynchronous functions.
