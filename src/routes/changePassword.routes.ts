import Router from "express";
import changePasswordController from "../controllers/password.controller";

const passwordRouter = Router();

passwordRouter.post("/change-password", changePasswordController);
