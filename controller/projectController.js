import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Project } from "../models/projectSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const addNewProject = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Project Banner Required!"));
  }
  const { projectBanner } = req.files;
  const { title, description, gitRepoLink, technologies, stack, deployed } =
    req.body;

  if (
    !title ||
    !description ||
    !gitRepoLink ||
    !technologies ||
    !stack ||
    !deployed
  ) {
    return next(new ErrorHandler("Provide All Details!"));
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    projectBanner.tempFilePath,
    { folder: "PROJECT BANNER" }
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary Errors"
    );
    return next(
      new ErrorHandler("Failed To Upload Project Banner to cloudinary!", 500)
    );
  }
  const project = await Project.create({
    title,
    description,
    gitRepoLink,
    technologies,
    stack,
    deployed,
    projectBanner: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(201).json({
    success: true,
    message: "Project Added!",
    project,
  });
});
export const updateProject = catchAsyncErrors(async (req, res, next) => {
  const newProjectData = {
    title: req.body.title,
    description: req.body.description,
    gitRepoLink: req.body.gitRepoLink,
    technologies: req.body.technologies,
    stack: req.body.stack,
    deployed: req.body.deployed,
  };

  if (req.files && req.files.projectBanner) {
    const projectBanner = req.files.projectBanner;
    const project = await Project.findById(req.params.id);
    await cloudinary.uploader.destroy(project.projectBanner.public_id);

    const cloudinaryResponse = await cloudinary.uploader.upload(
      projectBanner.tempFilePath,
      { folder: "PROJECT BANNER" }
    );
    newProjectData.projectBanner = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    newProjectData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    message: "Project Updated",
    project,
  });
});
export const deleteProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const project = await Project.findById(id);
  if (!project) {
    return next(new ErrorHandler("Project Not Found!", 404));
  }
  await project.deleteOne();
  res.status(200).json({
    success: true,
    message: "Project Deleted!",
  });
});
export const getAllProjects = catchAsyncErrors(async (req, res, next) => {

  const project = await Project.find();
  res.status(200).json({
    success: true,
    project,
  })

});
export const getSingleProject = catchAsyncErrors(async (req, res, next) => {

  const {id} = req.params;
  const project  = await Project.findById(id);
  if(!project){
    return next(new ErrorHandler("Project Not Found!"));
  }
  res.status(200).json({
    success: true,
    project,
  })

});
