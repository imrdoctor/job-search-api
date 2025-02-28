import { Router } from "express";
import * as CS from "./company.service.js";
import * as CV from "./company.validations.js";
import { validation } from "../../middleware/validation.js";
import * as ATH from "../../middleware/auth.js";
import {
  fileTypes,
  multerCloud,
  multerLocal,
} from "../../middleware/multer.js";

const companyController = Router();
companyController.post(
  "/add-company",
  validation(CV.addCompanySchema),
  ATH.findCompanyDetails("unique"),
  ATH.authorization(),
  CS.addCompany
);

companyController.patch(
  "/update-company/:companyId",
  validation(CV.updateCompanySchema),
  ATH.findCompanyDetails("unique"),
  ATH.authorization(),
  CS.updateCompany
);

companyController.delete(
  "/delete-company/:companyId",
  validation(CV.deleteCompanySchema),
  ATH.authorization(),
  CS.deleteCompany
);

companyController.delete(
  "/delete-company/:companyName",
  validation(CV.deleteCompanySchema),
  ATH.authorization(),
  CS.deleteCompany
);

companyController.get(
  "/search-company/:companyName",
  validation(CV.searchCompanySchema),
  ATH.authorization(),
  CS.getCompany
);

companyController.get(
  "/get-company/:companyId",
  validation(CV.getCompanySchema),
  ATH.authorization(),
  CS.getCompanyWithJobs
);

companyController.post(
  "/change-logo/:companyId",
  ATH.authorization(),
  multerCloud(
    [...fileTypes.image, ...fileTypes.animatedImage],
    3 * 1024 * 1024
  ).single("logo"),
  validation(CV.updateCompanyImgs),
  CS.changeLogo
);
companyController.post(
  "/change-cover/:companyId",
  ATH.authorization(),
  multerCloud(
    [...fileTypes.image, ...fileTypes.animatedImage],
    3 * 1024 * 1024
  ).single("cover"),
  validation(CV.updateCompanyImgs),
  CS.changeCover
);
companyController.post(
  "/remove-logo/:companyId",
  ATH.authorization(),
  validation(CV.paramsCompanyIdSchema),
  CS.deleteLogo
);
companyController.post(
  "/remove-cover/:companyId",
  ATH.authorization(),
  validation(CV.paramsCompanyIdSchema),
  CS.deleteCover
);
companyController.post(
  "/add-hr/:companyId",
  ATH.authorization(),
  validation(CV.addHrSchema),
  CS.addHr
);
companyController.post(
  "/remove-hr/:companyId",
  ATH.authorization(),
  validation(CV.addHrSchema),
  CS.removeHr
);
companyController.post(
  "/upload-legal/:companyId",
  ATH.authorization(),
  multerCloud(
    [...fileTypes.image, ...fileTypes.document],
    3 * 1024 * 1024
  ).single("attachement"),
  validation(CV.updateCompanyImgs),
  CS.uploadlegalAttachement
);
export default companyController;
