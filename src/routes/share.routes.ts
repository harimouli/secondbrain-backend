import { Router } from "express";

const shareRouter = Router();
import {
  shareUrlController,
  shareStatusController,
  sharedContentController,
} from "../controllers/share.controller";

shareRouter.post("/shareurl", shareUrlController);
shareRouter.get("/status", shareStatusController);
shareRouter.get("/sharedcontent/:sharelink", sharedContentController);
export default shareRouter;
