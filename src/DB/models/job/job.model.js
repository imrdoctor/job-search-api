import mongoose from "mongoose";

export const defaultJobLocations = {
    onsite: "onsite",
    remotely: "remotely",
    hybrid: "hybrid"
};

export const defaultWorkingTimes = {
    partTime: "part-time",
    fullTime: "full-time"
};

export const defaultSeniorityLevels = {
    fresh: "fresh",
    junior: "Junior",
    midLevel: "Mid-Level",
    senior: "Senior",
    teamLead: "Team-Lead",
    cto: "CTO"
};
export const defaultSortOptions = {
    jobTitle: "jobTitle",
    jobLocation: "jobLocation",
    workingTime: "workingTime",
    seniorityLevel: "seniorityLevel",
    jobDescription: "jobDescription",
    technicalSkills: "technicalSkills",
    softSkills: "softSkills",
    createdAt: "createdAt"
};

const jobSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: true,
        trim: true
    },
    jobLocation: {
        type: String,
        required: true,
        enum: Object.values(defaultJobLocations),
        trim: true
    },
    workingTime: {
        type: String,
        required: true,
        enum: Object.values(defaultWorkingTimes),
        trim: true
    },
    seniorityLevel: {
        type: String,
        required: true,
        enum: Object.values(defaultSeniorityLevels),
        trim: true
    },
    jobDescription: {
        type: String,
        required: true,
        trim: true
    },
    technicalSkills: {
        type: [String],
        required: true
    },
    softSkills: {
        type: [String],
        required: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    closed: {
        type: Boolean,
        default: false
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    }
}, { timestamps: true });

const jobModel = mongoose.models.Job || mongoose.model("Job", jobSchema);
export default jobModel;