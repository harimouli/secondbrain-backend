import express from "express";
import { Response, Request, NextFunction } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { requestRateLimiter } from "./middleware/ratelimiter";

import { authRateLimiter } from "./middleware/authRateLimiter";

import { AuthRequest } from "./middleware/middleware";

import cors from "cors";

import { UserModel } from "./models/user.model";
import { ContentModel } from "./models/content.model";
import { LinkModel } from "./models/link.model";

import { generateUrlHash } from "./utils";
import { userMiddleware } from "./middleware/middleware";
import authRouter from "./routes/auth.routes";
import connectDB from "./config/db";

import dotenv from "dotenv";

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
      "https://secondbrain-frontend-snowy.vercel.app",
    ],
    credentials: true,
  }),
);

app.use("/api/v1/auth", authRateLimiter, authRouter);

app.post(
  "/api/v1/content",
  userMiddleware,
  async (req: AuthRequest, res: Response) => {
    const link = req.body.link;
    const title = req.body.title;
    const type = req.body.type;

    const userId = req?.userId;

    try {
      await ContentModel.create({
        title,
        link,
        type,
        userId,
      });
    } catch (err) {
      res.status(501).json({
        success: false,
        message: "Something went wrong!",
      });
    }

    res.status(201).json({
      success: true,
      message: "Content added successfully!",
    });
  },
);

app.get(
  "/api/v1/content",
  userMiddleware,
  async (req: AuthRequest, res: Response) => {
    const userId: mongoose.Types.ObjectId | undefined = req.userId;

    try {
      const userId = req.userId;
      const content = await ContentModel.find({
        userId,
      }).populate("userId", "username");

      res.status(200).json({
        content,
      });
    } catch {
      res.status(500).json({
        message: "Something went wrong!",
      });
    }
  },
);

app.delete(
  "/api/v1/content",
  userMiddleware,
  async (req: AuthRequest, res: Response) => {
    const link = req.body.link;
    const userId: mongoose.Types.ObjectId | undefined = req?.userId;
    try {
      const response = await ContentModel.deleteOne({
        link,
        userId,
      });

      res.status(200).json({
        message: "Deleted succesfully!",
      });
    } catch (err) {
      res.status(403).json({
        message: "Something went wrong!",
      });
    }
  },
);

app.post(
  "/api/v1/mind/shareurl",
  userMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { isPublic } = req.body;
      if (isPublic) {
        const hash: string = generateUrlHash(6); // here iam genertaing colison free hash using base62 encoding + crypto random bytes..lol

        // this will enuser if link is available already for that user , then it will return that link instead of creating new one .. lol or it will create new one .. lol
        const link = await LinkModel.findOneAndUpdate(
          { userId: req.userId },
          { $setOnInsert: { userId: req.userId, hash } },
          { upsert: true, new: true },
        );

        await UserModel.updateOne(
          { _id: req.userId },
          { isShareEnabled: true },
        ); // enabling sharing functionality for user in user collection..lol
        // if link already existis in db , then we are just returning that link .. lol
        res.status(200).json({
          success: true,
          hash: `https://secondbrain-frontend-snowy.vercel.app/mind/${link.hash}`,
          isShareEnabled: true,
          message: "Your link is live now!",
        });
      }
      // if user wants to disable sharing functionality , they can do so this way ..lol
      else {
        try {
          await UserModel.findOneAndUpdate(
            { _id: req.userId },
            { isShareEnabled: false },
          );

          await LinkModel.deleteOne({ userId: req.userId });

          res.status(200).json({
            success: true,
            hash: null,
            isShareEnabled: false,
            message: "Sharing disabled successfully!",
          });
        } catch (err) {
          res.status(500).json({
            hash: "",
            isShareEnabled: null, // or omit - state is unknown after failure
            message: "Something went wrong!",
          });
        }
      }
    } catch (error) {
      console.log("error in shareable link endpoint", error);
      res.status(500).json({
        success: false,
        hash: "",
        isShareEnabled: false,
        message: "Something went wrong!",
      });
    }
  },
);

// endpoint to fetch shared content using shareable link .. lol

app.get("/api/v1/mind/:sharelink", async (req, res) => {
  const sharelink = req.params.sharelink; // extracting shareable link from params

  try {
    const linkDoc = await LinkModel.findOne({
      // finding link document from link collection using the hash
      hash: sharelink,
    });

    if (!linkDoc) {
      // if no link found return 404
      res.status(404).json({
        message: "Shared link not found!",
      });
      return;
    }

    const userId = linkDoc.userId; // extracting userId from link document

    const sharedContent = await ContentModel.find({
      // finding all content associated with that userId
      userId: userId,
    });

    if (sharedContent.length === 0) {
      res.status(204).json({
        sharedContent: [],
        message: "No shared content found!",
      });
      return; // no content to share
    }

    res.status(200).json({
      sharedContent,
      message: "Shared content fetched successfully!", // successfully fetched shared content
    });
  } catch (err) {
    res.status(500).json({
      // internal server error
      message: "Something went wrong!",
    });
  }
});

app.get(
  "/api/v1/verifylogin",
  userMiddleware,
  async (req: AuthRequest, res: Response) => {
    res.status(200).send({
      message: "verified!",
    });
  },
);

connectDB();

app.listen(process.env.PORT || PORT, () => {
  console.log("server is listening on port");
});
