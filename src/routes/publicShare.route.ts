import { Router } from "express";

const publicShareRouter = Router();

import { sharedContentController } from "../controllers/publicShare.controller";

publicShareRouter.get("/:sharelink", sharedContentController);
export default publicShareRouter;
