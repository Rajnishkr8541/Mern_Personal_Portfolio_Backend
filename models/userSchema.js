import mongoose from "mongoose"; // Importing Mongoose library
import bcrypt from "bcrypt"; // Importing bcrypt for password hashing
import jwt from "jsonwebtoken"; // Importing jsonwebtoken for creating JWTs
import crypto from "crypto"; // Importing crypto for generating tokens

// Defining the user schema
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Name Required"], // Full name is required
    },
    email: {
        type: String,
        required: [true, "Email Required"], // Email is required
        unique: true, // Ensuring email is unique
    },
    phone: {
        type: String,
        required: [true, "Phone no. Required"], // Phone number is required
    },
    aboutMe: {
        type: String,
        required: [true, "About Me field is Required"], // About Me is required
    },
    password: {
        type: String,
        required: [true, "Password is Required"], // Password is required
        minLength: [8, "Password must contain at least 8 Characters!"], // Minimum length validation
        select: false, // Password will not be selected by default
    },
    avatar: { // Avatar object for user profile picture
        public_id: {
            type: String,
            required: true, // Public ID is required
        },
        url: {
            type: String,
            required: true, // URL for the avatar image is required
        },
    },
    resume: { // Resume object for user upload
        public_id: {
            type: String,
            required: true, // Public ID for resume is required
        },
        url: {
            type: String,
            required: true, // URL for the resume is required
        },
    },
    portfolioUrl: {
        type: String,
        required: [true, "Portfolio URL is Required!"], // Portfolio URL is required
    },
    githubUrl: String,
    instagramUrl: String,
    facebookUrl: String,
    linkedInUrl: String,
    twitterUrl: String,
    resetPasswordToken: String, // For password reset functionality
    resetPasswordExpire: Date, // Expiration date for the reset token
});

// Pre-save hook to hash password before saving
userSchema.pre("save", async function(next) {
    // Check if the password has been modified
    if (!this.isModified("password")) {
        return next(); // If not modified, skip hashing
    }
    // Hashing the password using bcrypt
    this.password = await bcrypt.hash(this.password, 10);
    next(); // Proceed to save
});

// Method to compare entered password with the hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password); // Comparing passwords
};

// Method to generate JSON Web Token
userSchema.methods.generateJsonWebToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, { // Signing the JWT with user ID
        expiresIn: process.env.JWT_EXPIRES // Setting expiration time
    });
};

// Method to generate reset password token
userSchema.methods.getResetPasswordtoken = function() {
    const resetToken = crypto.randomBytes(20).toString("hex"); // Generating a random reset token

    // Hashing the reset token for storage
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Setting expiration time for the reset token
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes expiration
    return resetToken; // Returning the plain reset token
};

// Exporting the User model
export const User = mongoose.model("User", userSchema);
