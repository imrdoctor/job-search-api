import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    industry: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    numberOfEmployees: {
        type: String,
        required: true,
        enum: ["1-10", "11-20", "21-50", "51-100", "101-500", "500+"],
        trim: true
    },
    companyEmail: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    logo: {
        secure_url: String,
        public_id: String,
        default : Boolean
    },
    coverPic: {
        secure_url: String,
        public_id: String,
        default : Boolean
    },
    HRs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    bannedAt: Date,
    deletedAt: Date,
    legalAttachment: {
        secure_url: String,
        public_id: String
    },
    approvedByAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const companyModel = mongoose.models.Company || mongoose.model("Company", companySchema);
export default companyModel;
