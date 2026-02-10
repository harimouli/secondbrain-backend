import { Router } from "express";

import { accessTokenGenerator } from "../controllers/accessToken.controller";

const accessTokenGenRouter = Router();

accessTokenGenRouter.get("/access-token", accessTokenGenerator);
export default accessTokenGenRouter;
