import { Router } from "express";
import {
  addContentController,
  userContentController,
  shareContentController,
  contentDeleteController,
} from "../controllers/content.controller";
const contentRouter = Router();

contentRouter.post("/content", addContentController);
contentRouter.get("/content", userContentController);
contentRouter.patch("/content/share/:contentId", shareContentController);
contentRouter.delete("/content/:contentId", contentDeleteController);
export default contentRouter;
