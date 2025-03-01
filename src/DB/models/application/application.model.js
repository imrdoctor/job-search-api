import mongoose from "mongoose";

export const APPLICATION_STATUS = {
  pending: "pending",
  accepted: "accepted",
  viewed: "viewed",
  in_consideration: "in consideration",
  rejected: "rejected",
};

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userCV: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.pending,
    },
  },
  { timestamps: true }
);

const applicationModel = mongoose.models.Application || mongoose.model("Application", applicationSchema);

export default applicationModel 