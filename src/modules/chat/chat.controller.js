import { Router } from "express";
import * as CS from "./chat.service.js";
import * as CV from "./chat.validations.js";
import { validation } from "../../middleware/validation.js";
import * as ATH from "../../middleware/auth.js";
import { fileTypes, multerCloud } from "../../middleware/multer.js";
const chatController = Router();
chatController.get(
  "/users",
  ATH.authorization(),
  CS.getChatUsers
);
chatController.get(
  "/messages/:receiverId",
  ATH.authorization(),
  CS.getChatHistory
);
export default chatController;


