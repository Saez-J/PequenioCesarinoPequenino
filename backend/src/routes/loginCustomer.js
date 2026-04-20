import exprees from "express";
import loginCustomerController from "../controllers/loginCustomerController.js";
 
 
const router = exprees.Router();
 
router.route("/").post(loginCustomerController.login);
 
export default router;