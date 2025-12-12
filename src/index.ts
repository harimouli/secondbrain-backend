import express from "express";
import { Response, Request, NextFunction } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserSchema } from "./db";
import { type InferSchemaType } from "mongoose";

import { requestRateLimiter } from "./middleware/ratelimiter";

import { authRateLimiter } from "./middleware/authRateLimiter";

type UserType = InferSchemaType<typeof UserSchema>;

import { Link } from "./db";
import { AuthRequest } from "./middleware";

import { ObjectId } from "mongoose";

import cors from "cors";

import { UserModel, ContentModel, LinkModel } from "./db";

import { generateUrlHash } from "./utils";

import { JWT_SECRET, SALT_ROUNDS } from "./config";
import { userMiddleware } from "./middleware";
import authRouter from "./routes/auth.routes";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());

app.use(requestRateLimiter);
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://secondbrain-frontend-snowy.vercel.app",
    ],
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
        // checking user preference to enable sharing functionality..lol

        const existingLink: Link | null = await LinkModel.findOne({
          // checking if link aleady existing in link collections
          userId: req.userId,
        });

        if (existingLink) {
          // if link already existis in db , then we are just returning that link .. lol
          res.status(200).json({
            hash: `https://secondbrain-frontend-snowy.vercel.app/mind/${existingLink.hash}`,
            isShareEnabled: true,
          });
          return;
        }

        const session = await mongoose.startSession();
        try {
          const hash: string = generateUrlHash(6); // here iam genertaing colison free hash using base62 encoding + crypto random bytes..lol

          session.startTransaction(); // created a transaction for db consistency

          await UserModel.findByIdAndUpdate(
            { _id: req.userId },
            { isShareEnabled: true },
            { session },
          ); // enabling sharing functionality for user in user collection..lol
          await LinkModel.create([{ hash, userId: req.userId }], { session }); // creating new link in link collection
          await session.commitTransaction();
          session.endSession();

          res.status(200).json({
            hash: `https://secondbrain-frontend-snowy.vercel.app/mind/${hash}`,
            isShareEnabled: true,
            message: "Your link is live now!",
          });
        } catch (err) {
          await session.abortTransaction();
          session.endSession();
          res.status(500).json({
            hash: "",
            isShareEnabled: false,
            message: "Something went wrong!",
          });
        }
      }
      // if user wants to disable sharing functionality , they can do so this way ..lol
      else {
        const session = await mongoose.startSession();

        try {
          session.startTransaction();

          await UserModel.findOneAndUpdate(
            { _id: req.userId },
            { isShareEnabled: false },
            { session },
          );

          await LinkModel.deleteOne({ userId: req.userId }, { session });
          await session.commitTransaction();
          session.endSession();
          res.status(200).json({
            hash: null,
            isShareEnabled: false,
            message: "Sharing disabled successfully!",
          });
        } catch (err) {
          await session.abortTransaction();
          session.endSession();
          res.status(500).json({
            hash: null,
            isShareEnabled: null, // or omit - state is unknown after failure
            message: "Something went wrong!",
          });
        }
      }
    } catch {
      res.status(500).json({
        hash: null,
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

app.listen(process.env.PORT || PORT, () => {
  console.log("server is listening on port");
});
