import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtTokens.js";
import { sendEmail } from "../utils/sendEmail.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Avatar and Resume Required!", 400));
  }
  //USING FOR UPLOAD THE AVATAR(IMAGE)
  const { avatar } = req.files;

  const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
    avatar.tempFilePath,
    { folder: "AVATARS" }
  );
  if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponseForAvatar.error || "Unknown Cloudinary Errors"
    );
  }

  //USING FOR UPLOAD RESUME
  const { resume } = req.files;

  const cloudinaryResponseForResume = await cloudinary.uploader.upload(
    resume.tempFilePath,
    { folder: "MY_RESUME" }
  );
  if (!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponseForResume.error || "Unknown Cloudinary Errors"
    );
  }

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

  generateToken(user, "User Registered!", 201, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and Password Required!"));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password!"));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password!"));
  }
  generateToken(user, "Logged In", 200, res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      Message: "Logged out!",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

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

  // avatar

  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const user = await User.findById(req.user.id);
    const profileImageId = user.avatar.public_id;
    await cloudinary.uploader.destroy(profileImageId);

    const cloudinaryResponse = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      { folder: "AVATARS" }
    );
    newUserdata.avatar = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  //resume

  if (req.files && req.files.resume) {
    const resume = req.files.resume;
    const user = await User.findById(req.user.id);
    const resumeId = user.resume.public_id;
    await cloudinary.uploader.destroy(resumeId);

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
  });
  res.status(200).json({
    success: true,
    message: "Profile Updated!",
    user,
  });
});

export const updatePassword = catchAsyncErrors(async(req, res, next)=>{
  const {currentPassword, newPassword, confirmNewPassword} = req.body;

  if(!currentPassword || !newPassword || !confirmNewPassword){
    return next(new ErrorHandler("Please fill All Fields Correctly!", 400));
  }

  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(currentPassword);
  if(!isPasswordMatched){
    return next(new ErrorHandler("Incorrent Current Password", 400));
}

if(newPassword !== confirmNewPassword){
  return next(new ErrorHandler("Confirm Password Not matched with New Password", 400));
}
user.password = newPassword;
await user.save();
res.status(200).json({
  success:true,
  message: "Password Updated",
});

});

export const getUserForPortfolio = catchAsyncErrors(async(req, res, next)=>{
  const id="671216281ce1e7fbd7ebd964";
  const user = await User.findById(id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncErrors(async(req, res, next)=>{
  const user = await User.findOne({email: req.body.email});
  if(!user){
    return next(new ErrorHandler("User Not Found!", 404));
  }

  const resetToken = user.getResetPasswordtoken();
  await user.save({validateBeforeSave: false});
  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;
  const message = `Your reset Password token is:- \n\n ${resetPasswordUrl} \n\n ignore if your are not requested `;



  try {
    await sendEmail({
      email: user.email,
      subject: "Personal Portfolio Recovery Password",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} Successfully!`,
    })
    
  } catch (error) {
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();

    return next(new ErrorHandler(error.message, 500));
    
  }

});



