import catchAsyncErrors from "../middlewares/catchAsyncErrors.js"; // Middleware for handling async errors
import ErrorHandler from "../middlewares/error.js"; // Custom error handling class
import { User } from "../models/userSchema.js"; // Importing User model
import { v2 as cloudinary } from "cloudinary"; // Importing Cloudinary for file uploads
import { generateToken } from "../utils/jwtTokens.js"; // Utility for generating JWT tokens
import { sendEmail } from "../utils/sendEmail.js"; // Utility for sending emails
import crypto from "crypto"; // For generating secure tokens

// User registration route
export const register = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Avatar and Resume Required!", 400)); // Check for required files
  }

  // Upload Avatar (Image) to Cloudinary
  const { avatar } = req.files;
  const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
    avatar.tempFilePath,
    { folder: "AVATARS" } // Specify folder in Cloudinary
  );
  if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponseForAvatar.error || "Unknown Cloudinary Errors"
    );
  }

  // Upload Resume to Cloudinary
  const { resume } = req.files;
  const cloudinaryResponseForResume = await cloudinary.uploader.upload(
    resume.tempFilePath,
    { folder: "MY_RESUME" } // Specify folder in Cloudinary
  );

  // Extract user details from request body
  const {
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioUrl,
    githubUrl,
    instagramUrl,
    facebookUrl,
    linkedInUrl,
    twitterUrl,
  } = req.body;

  // Create a new user in the database
  const user = await User.create({
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioUrl,
    githubUrl,
    instagramUrl,
    facebookUrl,
    linkedInUrl,
    twitterUrl,
    avatar: {
      public_id: cloudinaryResponseForAvatar.public_id,
      url: cloudinaryResponseForAvatar.secure_url,
    },
    resume: {
      public_id: cloudinaryResponseForResume.public_id,
      url: cloudinaryResponseForResume.secure_url,
    },
  });

  generateToken(user, "User Registered!", 201, res); // Generate JWT token and send response
});

// User login route
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and Password Required!")); // Validate input fields
  }

  const user = await User.findOne({ email }).select("+password"); // Find user by email and select password
  if (!user || !(await user.comparePassword(password))) {
    return next(new ErrorHandler("Invalid Email or Password!")); // Validate password
  }

  generateToken(user, "Logged In", 200, res); // Generate JWT token for login
});

// User logout route
export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", { expires: new Date(Date.now()), httpOnly: true }) // Clear cookie
    .json({ success: true, Message: "Logged out!" });
});

// Get user details (for authenticated user)
export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id); // Find user by ID
  res.status(200).json({ success: true, user }); // Return user details
});

// Update user profile
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserdata = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    aboutMe: req.body.aboutMe,
    portfolioUrl: req.body.portfolioUrl,
    githubUrl: req.body.githubUrl,
    instagramUrl: req.body.instagramUrl,
    facebookUrl: req.body.facebookUrl,
    linkedInUrl: req.body.linkedInUrl,
    twitterUrl: req.body.twitterUrl,
  };

  // Update avatar if provided
  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const user = await User.findById(req.user.id);
    await cloudinary.uploader.destroy(user.avatar.public_id); // Delete old avatar from Cloudinary

    const cloudinaryResponse = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      { folder: "AVATARS" }
    );
    newUserdata.avatar = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  // Update resume if provided
  if (req.files && req.files.resume) {
    const resume = req.files.resume;
    const user = await User.findById(req.user.id);
    await cloudinary.uploader.destroy(user.resume.public_id); // Delete old resume from Cloudinary

    const cloudinaryResponse = await cloudinary.uploader.upload(
      resume.tempFilePath,
      { folder: "MY_RESUME" }
    );
    newUserdata.resume = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserdata, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  }); // Update user in database
  res.status(200).json({ success: true, message: "Profile Updated!", user });
});

// Update password
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler("Please fill All Fields Correctly!", 400));
  }

  const user = await User.findById(req.user.id).select("+password"); // Select password field for comparison
  if (!(await user.comparePassword(currentPassword))) {
    return next(new ErrorHandler("Incorrect Current Password", 400)); // Check if current password is correct
  }

  if (newPassword !== confirmNewPassword) {
    return next(
      new ErrorHandler("Confirm Password does not match New Password", 400)
    ); // Validate new passwords
  }

  user.password = newPassword; // Set new password
  await user.save(); // Save the updated user
  res.status(200).json({ success: true, message: "Password Updated" });
});

// Get user for portfolio
export const getUserForPortfolio = catchAsyncErrors(async (req, res, next) => {
  const id = "671216281ce1e7fbd7ebd964"; // Fixed user ID for portfolio
  const user = await User.findById(id); // Find user by ID
  res.status(200).json({ success: true, user }); // Return user data
});

// Forgot password (send reset token)
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }); // Find user by email
  if (!user) {
    return next(new ErrorHandler("User Not Found!", 404));
  }

  const resetToken = user.getResetPasswordToken(); // Generate reset token
  await user.save({ validateBeforeSave: false }); // Save token in database

  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`; // Construct reset URL
  const message = `Your reset password token is:\n\n${resetPasswordUrl}\n\nIgnore if not requested.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Personal Portfolio Password Recovery",
      message,
    }); // Send email with reset token
    res
      .status(200)
      .json({
        success: true,
        message: `Email sent to ${user.email} successfully!`,
      });
  } catch (error) {
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined; // Reset token if email fails
    await user.save();
    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset password using token
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex"); // Hash the token

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  }); // Find user with valid reset token

  if (!user) {
    return next(
      new ErrorHandler("Reset token is invalid or has expired!", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password do not match!", 400)
    ); // Check if passwords match
  }

  user.password = req.body.password; // Set new password
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined; // Clear reset token
  await user.save(); // Save updated user
  generateToken(user, "Password Reset Successfully!", 200, res); // Generate new token after password reset
});
