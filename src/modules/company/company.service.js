import { create } from "../../DB/dbService.js";
import * as DBS from "../../DB/dbService.js";
import applicationModel from "../../DB/models/application/application.js";
import companyModel from "../../DB/models/company/company.model.js";
import jobModel from "../../DB/models/job/job.model.js";
import userModel, { defaultRoles } from "../../DB/models/user/user.model.js";
import cloudinary from "../../utils/cloudinary/index.js";
import { asyncHandler, generateDefaultLogo, generateDefaultCover, } from "../../utils/utils.js";
export const addCompany = asyncHandler(async (req, res, next) => {
  const {
    companyName,
    description,
    industry,
    address,
    companyEmail,
    numberOfEmployees,
  } = req.body;
  console.log(
    companyName,
    description,
    industry,
    address,
    companyEmail,
    numberOfEmployees
  );

  const company = await DBS.create({
    model: companyModel,
    query: {
      companyName,
      description,
      industry,
      address,
      companyEmail,
      numberOfEmployees,
      createdBy: req.user._id,
    },
  });
  if (!company) { return next(new Error(`Error creating company. Please try again.`, { cause: { status: 400 }, })); }
  const defaultCompanyLogo = await generateDefaultLogo(company.companyName);
  const defaultCompanyCover = await generateDefaultCover(company.companyName);
  const [uploadedLogo, uploadedCover] = await Promise.all([
    cloudinary.uploader.upload(defaultCompanyLogo, {
      folder: "jobSearch/company/logo",
      public_id: company._id.toString(),
    }),
    cloudinary.uploader.upload(defaultCompanyCover, {
      folder: "jobSearch/company/cover",
      public_id: company._id.toString(),
    }),
  ]);
  await DBS.findByIdAndUpdate({
    model: companyModel,
    id: company._id,
    update: {
      "logo.secure_url": uploadedLogo.secure_url,
      "logo.public_id": uploadedLogo.public_id,
      "logo.default": true,
      "coverPic.secure_url": uploadedCover.secure_url,
      "coverPic.public_id": uploadedCover.public_id,
      "coverPic.default": true,
    },
  });
  return res.status(201).json({
    message: "Company created successfully",
    company: {
      companyName,
      logo: {
        secure_url: uploadedLogo.secure_url,
      },
      cover: {
        secure_url: uploadedCover.secure_url,
      }
    }
  });

});
export const updateCompany = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { companyId } = req.params;
  const company = await DBS.findById({
    model: companyModel,
    id: companyId,
  });
  if (!company) {
    return next(new Error(`Company not found`, { cause: { status: 404 } }));
  }
  if (company.createdBy.toString() !== user._id.toString()) {
    return next(
      new Error(`You are not authorized to update this company`, {
        cause: { status: 403 },
      })
    );
  }
  const updatedCompany = await DBS.findByIdAndUpdate({
    model: companyModel,
    id: companyId,
    update: {
      ...req.body,
    },
  });
  if (company.companyName !== updatedCompany.companyName) {
    const updateData = {};
    const destroyPromises = [];
    const uploadPromises = [];

    if (updatedCompany.logo.default) {
      destroyPromises.push(cloudinary.uploader.destroy(updatedCompany.logo.public_id));

      const defaultCompanyLogo = await generateDefaultLogo(req.body.companyName);
      uploadPromises.push(
        cloudinary.uploader.upload(defaultCompanyLogo, {
          folder: "jobSearch/company/logo",
          public_id: updatedCompany._id,
        })
      );
    }

    if (updatedCompany.coverPic.default) {
      destroyPromises.push(cloudinary.uploader.destroy(updatedCompany.coverPic.public_id));

      const defaultCompanyCover = await generateDefaultCover(req.body.companyName);
      uploadPromises.push(
        cloudinary.uploader.upload(defaultCompanyCover, {
          folder: "jobSearch/company/cover",
          public_id: updatedCompany._id,
        })
      );
    }

    if (destroyPromises.length) {
      await Promise.all(destroyPromises);
    }

    if (uploadPromises.length) {
      const [uploadedLogo, uploadedCover] = await Promise.all(uploadPromises);

      if (uploadedLogo) {
        updateData["logo.secure_url"] = uploadedLogo.secure_url;
        updateData["logo.public_id"] = uploadedLogo.public_id;
      }

      if (uploadedCover) {
        updateData["coverPic.secure_url"] = uploadedCover.secure_url;
        updateData["coverPic.public_id"] = uploadedCover.public_id;
      }

      await DBS.findByIdAndUpdate({
        model: companyModel,
        id: companyId,
        update: updateData,
      });
    }
  }


  return res.status(200).json({
    message: "Company updated successfully",
    updatedCompany: {
      Name: updatedCompany.companyName,
      Description: updatedCompany.description,
      Industry: updatedCompany.industry,
      Address: updatedCompany.address,
      Email: updatedCompany.companyEmail,
      NumberOfEmployees: updatedCompany.numberOfEmployees,
    },
  });
});
export const deleteCompany = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { companyId } = req.params;
  const company = await DBS.findById({
    model: companyModel,
    id: companyId,
  });
  if (!company) {
    return next(new Error(`Company not found`, { cause: { status: 404 } }));
  }
  // if(company.deletedAt){
  //     return next(new Error(`Company is already deleted`, { cause: { status: 400 }}))
  // }
  if (
    company.createdBy.toString() !== user._id.toString() &&
    user.role !== defaultRoles.admin
  ) {
    return next(
      new Error(`You are not authorized to delete this company`, {
        cause: { status: 403 },
      })
    );
  }
  let deletedaCompany
  if (!company.deletedAt) {
    const allJobs = await DBS.find({
      model: jobModel,
      filter: { companyId }
    });
    const jobIds = allJobs.map(job => job._id);
    await DBS.deleteMany({
      model: applicationModel,
      filter: { jobId: { $in: jobIds } }
    });
    await DBS.deleteMany({
      model: jobModel,
      filter: { companyId }
    });
    deletedaCompany = await DBS.findByIdAndUpdate({
      model: companyModel,
      id: companyId,
      update: {
        deletedAt: new Date()
      }
    })
  } else {
    deletedaCompany = await DBS.findByIdAndUpdate({
      model: companyModel,
      id: companyId,
      update: {
        deletedAt: null
      }
    })
  }

  return res.status(200).json({
    message: deletedaCompany.deletedAt
      ? "Company deleted successfully"
      : "Company successfully restored",
  });
});
export const getCompanyWithJobs = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await DBS.findById({
    model: companyModel,
    id: companyId,
  });
  if (!company) {
    return next(new Error(`Company not found`, { cause: { status: 404 } }));
  }
  const jobs = await DBS.find({
    model: jobModel,
    filter: {
      companyId: companyId,
    },
  });
  const data = [
    {
      company: {
        id: company._id,
        name: company.
          companyName,
        logo: company.logo.secure_url,
        cover: company.coverPic.secure_url,
        description: company.description,
        Jobs: jobs.map(job => ({
          id: job._id,
          title: job.jobTitle,
          location: job.jobLocation,
          description: job.jobDescription,
          technicalSkills: job.technicalSkills,
          softSkills: job.softSkills,
        })),
      },
    },
  ];
  return res.status(200).json({ data });
});
export const getCompany = asyncHandler(async (req, res, next) => {
  const { companyName } = req.params;
  const company = await DBS.findOne({
    model: companyModel,
    filter: {
      companyName: { $regex: new RegExp(companyName, "i") },
    },
  });
  if (!company) {
    return next(new Error(`Company not found`, { cause: { status: 404 } }));
  }
  return res.status(200).json({
    company: {
      _id: company._id,
      companyName: company.companyName,
      description: company.description,
      industry: company.industry,
      address: company.address,
      numberOfEmployees: company.numberOfEmployees,
      companyEmail: company.companyEmail,
      approvedByAdmin: company.approvedByAdmin,
    },
  });
});
export const changeLogo = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await DBS.findById({
    model: companyModel,
    id: companyId,
  });
  if (!company) {
    return next(new Error(`Company not found`, { cause: { status: 404 } }));
  }
  if (company.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new Error(`You are not authorized to delete this company`, {
        cause: { status: 403 },
      })
    );
  }
  if (company.logo.default) {
    await cloudinary.uploader.destroy(company.logo.public_id);
  }
  const uploadedLogo = await cloudinary.uploader.upload(req.file.path, {
    folder: "jobSearch/company/logo",
    public_id: company._id,
  });
  const updatedCompany = await DBS.findByIdAndUpdate({
    model: companyModel,
    id: companyId,
    update: {
      $set: {
        "logo.secure_url": uploadedLogo.secure_url,
        "logo.public_id": uploadedLogo.public_id,
        "logo.default": "false",
      },
    },
  });
  return res.status(200).json({
    message: "Logo updated successfully",
    company: {
      _id: updatedCompany._id,
      companyName: updatedCompany.companyName,
      logo: updatedCompany.logo?.secure_url,
      cover: updatedCompany.coverPic?.secure_url,
    },
  });
});
export const changeCover = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await DBS.findById({
    model: companyModel,
    id: companyId,
  });
  if (!company) {
    return next(new Error(`Company not found`, { cause: { status: 404 } }));
  }
  if (company.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new Error(`You are not authorized to delete this company`, {
        cause: { status: 403 },
      })
    );
  }
  if (company.coverPic.default) {
    await cloudinary.uploader.destroy(company.logo.public_id);
  }
  const uploadedCover = await cloudinary.uploader.upload(req.file.path, {
    folder: "jobSearch/company/cover",
    public_id: company._id,
  });
  const updatedCompany = await DBS.findByIdAndUpdate({
    model: companyModel,
    id: companyId,
    update: {
      $set: {
        "coverPic.secure_url": uploadedCover.secure_url,
        "coverPic.public_id": uploadedCover.public_id,
        "coverPic.default": false,
      },
    },
  });
  return res.status(200).json({
    message: "cover updated successfully",
    company: {
      _id: updatedCompany._id,
      companyName: updatedCompany.companyName,
      logo: updatedCompany.logo?.secure_url,
      cover: updatedCompany.coverPic?.secure_url,
    },
  });
});
export const deleteLogo = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  console.log(companyId);

  const company = await DBS.findById({
    model: companyModel,
    id: companyId,
  });
  if (!company) {
    return next(new Error(`Company not found`, { cause: { status: 404 } }));
  }
  if (company.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new Error(`You are not authorized to delete this company`, {
        cause: { status: 403 },
      })
    );
  }
  if (company.logo.default) {
    return res
      .status(200)
      .json({ message: "Logo is default, cannot be deleted" });
  }
  await cloudinary.uploader.destroy(company.logo.public_id);
  const defultCompany_Logo = await generateDefaultLogo(company.companyName);
  console.log(defultCompany_Logo);
  const uploadedLogo = await cloudinary.uploader.upload(defultCompany_Logo, {
    folder: "jobSearch/company/logo",
    public_id: company._id,
  });
  console.log(uploadedLogo);

  const updatedCompany = await DBS.findByIdAndUpdate({
    model: companyModel,
    id: companyId,
    update: {
      $set: {
        "logo.secure_url": uploadedLogo.secure_url,
        "logo.public_id": uploadedLogo.public_id,
        "logo.default": true,
      },
    },
  });
  return res.status(200).json({
    message: "Logo removed successfully",
    company: {
      _id: updatedCompany._id,
      companyName: updatedCompany.companyName,
      logo: updatedCompany.logo?.secure_url,
      cover: updatedCompany.coverPic?.secure_url,
    },
  });
});
export const deleteCover = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await DBS.findById({ model: companyModel, id: companyId });
  if (!company) {
    return next(new Error(`Company not found`, { cause: { status: 404 } }));
  }
  if (company.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new Error(`You are not authorized to delete this company`, {
        cause: { status },
      })
    );
  }
  if (company.coverPic.default) {
    return res
      .status(200)
      .json({ message: "Cover is default, cannot be deleted" });
  }
  await cloudinary.uploader.destroy(company.coverPic.public_id);
  const defaultCover = await generateDefaultCover(company.companyName);
  const uploadedCover = await cloudinary.uploader.upload(defaultCover, {
    folder: "jobSearch/company/cover",
    public_id: company._id,
  });
  const updatedCompany = await DBS.findByIdAndUpdate({
    model: companyModel,
    id: companyId,
    update: {
      $set: {
        "coverPic.secure_url": uploadedCover.secure_url,
        "coverPic.public_id": uploadedCover.public_id,
        "coverPic.default": true,
      },
    },
  });
  return res.status(200).json({
    message: "Cover removed successfully",
    company: {
      _id: updatedCompany._id,
      companyName: updatedCompany.companyName,
      logo: updatedCompany.logo?.secure_url,
      cover: updatedCompany.coverPic?.secure_url,
    },
  });
});
export const uploadlegalAttachement = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await DBS.findById({ model: companyModel, id: companyId });
  if (!company) {
    return next(new Error(`Company not found`, { cause: { status: 404 } }));
  }
  if (req.user._id.toString() !== company.createdBy.toString()) {
    return next(
      new Error(
        `You are not authorized to upload legal documents for this company`,
        { caus: { status: 403 } }
      )
    );
  }
  const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
    folder: "jobSearch/company/legal",
    public_id: `${company._id}_${new Date().toISOString().split("T")[0]}`,
  });
  const updatedCompany = await DBS.findByIdAndUpdate({
    model: companyModel,
    id: companyId,
    update: {
      "legalAttachment.secure_url": uploadedFile.secure_url,
      "legalAttachment.public_id": uploadedFile.public_id,
    },
  });
  return res.status(200).json({
    message: "Legal attachment uploaded successfully",
    company: {
      _id: updatedCompany._id,
      companyName: updatedCompany.companyName,
    },
  });
});
export const addHr = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const { userID } = req.body;
  if (userID === req.user._id) {
    return next(
      new Error("You cannot add yourself as HR", { cause: { status: 400 } })
    );
  }
  const userExsist = await DBS.findById({ model: userModel, id: userID });
  if (!userExsist) {
    return next(new Error("User not found", { cause: { status: 404 } }));
  }
  const company = await DBS.findById({ model: companyModel, id: companyId });

  if (!company) {
    return next(new Error(`Company not found`, { cause: { status: 404 } }));
  }
  if (company.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new Error(`You are not authorized to add HR to this company`, {
        cause: { status: 401 },
      })
    );
  }
  if (company.HRs.includes(userID)) {
    return res
      .status(200)
      .json({ message: "This user arledy has HR role in this company" });
  }
  const updatedCompany = await DBS.findByIdAndUpdate({
    model: companyModel,
    id: companyId,
    update: {
      $push: {
        HRs: userID,
      },
    },
  });
  return res.status(200).json({
    message: "HR added successfully",
  });
});
export const removeHr = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const { userID } = req.body;
  if (userID === req.user._id) {
    return next(
      new Error("You cannot remove yourself from HRs", {
        cause: { status: 400 },
      })
    );
  }
  const userExsist = await DBS.findById({ model: userModel, id: userID });
  if (!userExsist) {
    return next(new Error("User not found", { cause: { status: 404 } }));
  }
  const company = await DBS.findById({ model: companyModel, id: companyId });

  if (!company) {
    return next(new Error(`Company not found`, { cause: { status: 404 } }));
  }
  if (company.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new Error(`You are not authorized to add HR to this company`, {
        cause: { status: 401 },
      })
    );
  }
  if (!company.HRs.includes(userID)) {
    return next(
      new Error(`This user not HR in this company`, { cause: { status: 401 } })
    );
  }
  await DBS.findByIdAndUpdate({
    model: companyModel,
    id: companyId,
    update: {
      $pull: { HRs: userID },
    },
  });
  return res.status(200).json({
    message: "HR removed successfully",
  });
});