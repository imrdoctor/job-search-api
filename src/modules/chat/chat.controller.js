import { Router } from "express";
import * as CS from "./chat.service.js";
import * as CV from "./chat.validations.js";
import { validation } from "../../middleware/validation.js";
import * as ATH from "../../middleware/auth.js";
import { fileTypes, multerCloud } from "../../middleware/multer.js";
const chatController = Router();
chatController.get(
  "/users",
  // validation(CV.addjobSchema),
  ATH.authorization(),
  CS.getChatUsers
);
export default chatController;


