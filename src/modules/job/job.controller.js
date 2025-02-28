import { Router } from "express";
import * as JS from "./job.service.js";
import * as JV from "./job.validations.js";
import { validation } from "../../middleware/validation.js";
import * as ATH from "../../middleware/auth.js";
import { fileTypes, multerCloud } from "../../middleware/multer.js";
const jobController = Router();
jobController.post(
  "/add-job/:companyId",
  validation(JV.addjobSchema),
  ATH.authorization(),
  JS.addJob
);
jobController.post(
  "/update-job/:jobId",
  validation(JV.updatejobSchema),
  ATH.authorization(),
  JS.updateJob
);
jobController.post(
  "/delete-job/:jobId",
  validation(JV.updatejobSchema),
  ATH.authorization(),
  JS.deleteJob
);
jobController.post(
  "/delete-job/:jobId",
  validation(JV.getAllCompanyJobsSchema),
  ATH.authorization(),
  JS.deleteJob
);
jobController.post(
  "/get-job/:companyId?",
  validation(JV.filterCompanyJobsSchema),
  ATH.authorization(),
  JS.getAllCompanyJobs
);
jobController.post(
  "/applay-job/:jobId",
  multerCloud(
    [...fileTypes.image, ...fileTypes.document],
    5 * 1024 * 1024
  ).single('cv'),
  validation(JV.applayJobJobsSchema),
  ATH.authorization(),
  JS.applyJob
);
jobController.post(
  "/interaction-applay/:applicationId",
  validation(JV.interactionApplcaySchema),
  ATH.authorization(),
  JS.intractionApplay
);
export default jobController;
