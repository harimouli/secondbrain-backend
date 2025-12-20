import { Router } from "express";
import {
  signupController,
  signinController,
} from "../controllers/auth.controller";

import { verifyauth } from "../controllers/verifyauth.controller";
const authRouter = Router();

authRouter.post("/signup", signupController);
authRouter.post("/signin", signinController);
authRouter.get("/verifylogin", verifyauth);

export default authRouter;
