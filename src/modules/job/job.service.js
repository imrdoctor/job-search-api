import * as DBS from "../../DB/dbService.js";
import applicationModel, { APPLICATION_STATUS } from "../../DB/models/application/application.js";
import companyModel from "../../DB/models/company/company.model.js";
import jobModel from "../../DB/models/job/job.model.js";
import cloudinary from "../../utils/cloudinary/index.js";
import { asyncHandler, eventEmitter, generateDefaultLogo } from "../../utils/utils.js";
export const addJob = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
    const user = req.user;
    const company = await DBS.findById({
        model: companyModel,
        id: companyId,
    });
    if (!company) {
        return res.status(404).json({ message: "Company not found" });
    }
    if (!company.approvedByAdmin) {
        return res.status(403).json({ message: "Company not approved" });
    }
    if (
        !company.HRs.includes(user._id.toString()) &&
        user._id.toString() !== company.createdBy.toString()
    ) {
        return res
            .status(403)
            .json({ message: "You are not authorized to add this company" });
    }

    const {
        jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills,
    } = req.body;
    const job = await DBS.create({
        model: jobModel,
        query: {
            jobTitle,
            jobLocation,
            workingTime,
            seniorityLevel,
            jobDescription,
            technicalSkills,
            softSkills,
            addedBy: user._id,
            companyId,
        },
    });
    return res.status(201).json({ message: "Job created successfully" });
});
export const updateJob = asyncHandler(async (req, res, next) => {
    const { jobId } = req.params;
    const user = req.user;
    const job = await DBS.findById({
        model: jobModel,
        id: jobId,
    });
    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }
    const company = await DBS.findById({
        model: companyModel,
        id: job.companyId.toString(),
    });

    if (!company) {
        return res
            .status(404)
            .json({ message: "Company maked this job not found" });
    }
    if (user._id.toString() !== company.createdBy.toString()) {
        return res
            .status(403)
            .json({ message: "You are not authorized to update this job" });
    }
    const updatedJob = await DBS.findByIdAndUpdate({
        model: jobModel,
        id: jobId,
        update: {
            $set: { ...req.body },
            updatedBy: user._id,
        },
    });

    return res.status(200).json({ message: "Job updated successfully" });
});

export const deleteJob = asyncHandler(async (req, res, next) => {
    const { jobId } = req.params;
    const user = req.user;
    const job = await DBS.findById({
        model: jobModel,
        id: jobId,
    });
    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }
    const company = await DBS.findById({
        model: companyModel,
        id: job.companyId.toString(),
    });
    if (!company) {
        return res
            .status(404)
            .json({ message: "Company maked this job not found" });
    }
    if (
        !company.HRs.includes(user._id.toString()) &&
        user._id.toString() !== company.createdBy.toString()
    ) {
        return res
            .status(403)
            .json({ message: "You are not authorized to add this company" });
    }
    const deletedJob = await DBS.findByIdAndDelete({
        model: jobModel,
        id: jobId,
    });

    return res.status(200).json({ message: "Job deleted successfully" });
});

export const getAllCompanyJobs = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
    let { jobId, companyName, sort = "-createdAt", page, limit } = req.query;

    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(Math.max(1, parseInt(limit) || 3), 3);
    const skip = (page - 1) * limit;

    const sortObj = sort.split(",").reduce((acc, field) => {
        const key = field.startsWith("-") ? field.substring(1) : field;
        acc[key] = field.startsWith("-") ? -1 : 1;
        return acc;
    }, {});

    let filter = {};

    if (companyId) {
        filter.companyId = companyId;
    } else if (companyName) {
        const company = await DBS.findOne({
            model: companyModel,
            filter: {
                companyName: { $regex: new RegExp(companyName, "i") },
            },
        });

        if (!company) {
            return next(new Error("Company not found", { cause: { status: 403 } }));
        }

        filter.companyId = company._id;
    }

    if (jobId) {
        filter._id = jobId;
    }

    const jobs = await DBS.find({
        model: jobModel,
        filter,
        skip,
        limit,
        sort: sortObj,
    });
    if (jobs.length <= 0) {
        return res.status(404).json({ message: "No jobs found" });
    }
    const totalCount = await jobModel.countDocuments(filter);

    res.status(200).json({
        message: "Jobs fetched successfully",
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        jobs,
    });
});

export const getAlljobs = asyncHandler(async (req, res, next) => {
    let {
        sort = "createdAt",
        page,
        limit,
        workingTime,
        jobLocation,
        seniorityLevel,
        jobTitle,
        technicalSkills,
    } = req.query;

    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(Math.max(1, parseInt(limit) || 3), 3);
    const skip = (page - 1) * limit;

    const filter = {};

    if (workingTime) filter.workingTime = workingTime;
    if (jobLocation) filter.jobLocation = jobLocation;
    if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
    if (jobTitle) filter.jobTitle = new RegExp(jobTitle, "i");
    if (technicalSkills)
        filter.technicalSkills = { $in: technicalSkills.split(",") };

    const jobs = await DBS.find({
        model: jobModel,
        filter,
        sort,
        skip,
        limit,
    });

    const totalJobs = await jobModel.countDocuments(filter);

    res.status(200).json({
        success: true,
        totalJobs,
        page,
        totalPages: Math.ceil(totalJobs / limit),
        data: jobs,
    });
});
export const applyJob = asyncHandler(async (req, res, next) => {
    const { jobId } = req.params;
    const user = req.user;
    const job = await DBS.findById({
        model: jobModel,
        id: jobId,
    });
    if (!job) return next(new Error("Job not found", { cause: { status: 403 } }));
    const alreadyApplayed = await DBS.findOne({
        model: applicationModel,
        filter: { userId: user._id, jobId },
    });
    if (alreadyApplayed)
        return next(
            new Error("You already applied for this job", { cause: { status: 403 } })
        );
    const company = await DBS.findOne({
        model: companyModel,
        filter: { _id: job.companyId },
    });

    if (!company) {
        return next(
            new Error("Crated Company not found", { cause: { status: 403 } })
        );
    }
    const isOwnerOrHR =
        company.createdBy.toString() === user._id.toString() ||
        company.hrIds.some((hrId) => hrId.toString() === user._id.toString());
    if (isOwnerOrHR)
        return next(
            new Error("Nice Try! You Arleady work at this company", {
                cause: { status: 403 },
            })
        );
    const cv = await cloudinary.uploader.upload(req.file.path, {
        folder: "jobSearch/application/cv",
        public_id: `${req.user._id}_${jobId}`,
    });

    const newApplication = await DBS.create({
        model: applicationModel,
        query: {
            userId: user._id,
            jobId: jobId,
            "userCV.secure_url": cv.secure_url,
            "userCV.public_id": cv.public_id,
        },
    });
    return res
        .status(200)
        .json({ msg: " Done Send Your Application ", data: newApplication });
});

export const intractionApplay = asyncHandler(async (req, res, next) => {
    const { intractionType } = req.body;
    const { applicationId } = req.params;

    const application = await DBS.findById({
        model: applicationModel,
        id: applicationId,
        populate: [
            {
                path: "jobId",
                select: "title companyId jobLocation jobTitle",
                populate: {
                    path: "companyId",
                    select: "name industry HRs logo createdBy",
                },
            },
            {
                path: "userId",
                select: "username email firstName",
            },
        ],
    });

    if (!application) {
        return next(new Error("Application not found", { cause: { status: 404 } }));
    }

    const company = application.jobId?.companyId;
    if (!company) {
        return next(new Error("Company not found", { cause: { status: 404 } }));
    }

    const applicant = application.userId;
    if (!applicant) {
        return next(new Error("Applicant data missing", { cause: { status: 500 } }));
    }

    const isOwnerOrHR = company.createdBy.toString() === req.user._id.toString() || company.HRs.some((hr) => hr.toString() === req.user._id.toString());

    if (!isOwnerOrHR) {
        return next(new Error("Unauthorized! You must be an Owner or HR to interact with applications.", { cause: { status: 403 } }));
    }

    if (application.status === APPLICATION_STATUS.accepted || application.status === APPLICATION_STATUS.rejected) {
                return next(new Error(`This application has already been ${application.status}. No further changes allowed`,  { cause: { status: 400 } }));
    }

    if (application.status === APPLICATION_STATUS.pending && intractionType === APPLICATION_STATUS.pending) {
        return next(new Error(`Application is still pending `,  { cause: { status: 200 } }));
    }

    if (![APPLICATION_STATUS.pending, APPLICATION_STATUS.viewed, APPLICATION_STATUS.in_consideration].includes(application.status)) {
        return next(new Error("This application has already been processed", { cause: { status: 400 } }));
    }

    await DBS.findByIdAndUpdate({
        model: applicationModel,
        id: applicationId,
        update: { status: intractionType },
    });

    const emailData = {
        email: applicant.email,
        firstName: applicant.firstName,
        logo: company.logo?.secure_url || "",
        jobTitle: application.jobId.jobTitle,
    };

    if (intractionType === APPLICATION_STATUS.accepted) {
        eventEmitter.emit("acceptedEmail", emailData);
    } else if (intractionType === APPLICATION_STATUS.rejected) {
        eventEmitter.emit("rejectedEmail", emailData);
    }

    return res.status(200).json({
        msg: `Application has been ${intractionType} successfully.`,
        previousStatus: application.status,
        newStatus: intractionType,
    });
});




