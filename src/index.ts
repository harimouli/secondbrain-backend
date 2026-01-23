import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { requestRateLimiter } from "./middleware/ratelimiter";
import { authRateLimiter } from "./middleware/authRateLimiter";
import { userMiddleware } from "./middleware/middleware";
import authRouter from "./routes/auth.routes";
import contentRouter from "./routes/content.routes";
import publicShareRouter from "./routes/publicShare.route";
import connectDB from "./config/db";
import shareRouter from "./routes/share.routes";
import changePasswordRouter from "./controllers/password.controller";

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(requestRateLimiter);
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5173/",
      "https://secondbrain-frontend-snowy.vercel.app",
    ],
    credentials: true,
  }),
);

app.use("/api/v1/auth", authRateLimiter, authRouter);
app.use("/api/v1/mind", userMiddleware, contentRouter);
app.use("/api/v1/contentshare", userMiddleware, shareRouter);
app.use("/api/v1/public-content", publicShareRouter);
app.use("/api/v1/authpassword", userMiddleware, changePasswordRouter);

connectDB();

app.listen(process.env.PORT || PORT, () => {
  console.log(`server is listening on port ${process.env.PORT || PORT}`);
});
