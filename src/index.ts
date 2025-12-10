import express from "express";
import { Response, Request, NextFunction } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserSchema } from "./db";
import { type InferSchemaType } from "mongoose";

// Extend Express Request interface to include userId
type UserType = InferSchemaType<typeof UserSchema>;

import { Link } from "./db";
import { AuthRequest } from "./middleware";

import { ObjectId } from "mongoose";
import jwt from "jsonwebtoken";
import cors from "cors";

import { UserModel, ContentModel, LinkModel } from "./db";

import { generateUrlHash } from "./utils";

import { JWT_SECRET, SALT_ROUNDS } from "./config";
import { userMiddleware } from "./middleware";

import dotenv from "dotenv";
import { get } from "http";
dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://secondbrain-frontend-snowy.vercel.app",
    ],
  }),
);

app.post("/api/v1/signup", async (req: Request, res: Response) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const existingUser = await UserModel.findOne({
      username,
    });
    if (existingUser) {
      res.status(201).send({
        message: "user already exists! please signin",
      });

      return;
    }
    await UserModel.create({
      username: username,
      password: hashedPassword,
    });
    res.send({
      message: "you are signed up!",
    });
  } catch (err) {
    res.status(500).json({
      message: "something went wrong!",
    });
    return;
  }
});

app.post("/api/v1/signin", async (req: Request, res: Response) => {
  try {
    const username: string = req.body.username;
    const password: string = req.body.password;

    const existingUser = await UserModel.findOne({
      username,
    });

    if (!existingUser) {
      res.status(401).json({
        message: "Invalid username or password",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password!,
    );
    if (!isPasswordValid) {
      res.status(401).json({
        message: "Invalid password! or username",
      });
      return;
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      token: token,

      userDetails: {
        username: existingUser.username,
        dateOfJoined: existingUser.dateOfJoined,
        isShareEnabled: existingUser.isShareEnabled,
      },

      message: "You are logged in!",
    });
  } catch {
    res.status(500).json({
      message: "something went wrong!",
    });
  }
});

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
        message: "Something went wrong!",
      });
    }

    res.status(200).json({
      message: "Content added!",
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
  "/api/v1/brain/share-url",
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
            hash: `https://secondbrain-frontend-snowy.vercel.app/brain/${existingLink.hash}`,
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
            hash: `https://secondbrain-frontend-snowy.vercel.app/brain/${hash}`,
            isShareEnabled: true,
            message: "Your link is live now!",
          });
        } catch (err) {
          session.abortTransaction();
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
          session.commitTransaction();
          session.endSession();
          res.status(200).json({
            hash: null,
            isShareEnabled: false,
            message: "Sharing disabled successfully!",
          });
        } catch (err) {
          session.abortTransaction();
          session.endSession();
          res.status(500).json({
            hash: null,
            isShareEnabled: true,
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

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;

  const link = await LinkModel.findOne({
    hash,
  });

  if (!link) {
    res.status(404).json({
      message: "Sorry incorrect input!",
    });
    return;
  }
  const userId = link.userId;
  const content = await ContentModel.find({
    userId,
  }).populate("userId", "username");
  /*if(!user) {
        res.status(411).json({
            message: "user not found , should ideally not happen!"  
        })
        return;
    } */

  res.status(200).json({
    content,
  });
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

app.post(
  "/api/v1/change-password",
  userMiddleware,
  async (req: AuthRequest, res: Response) => {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const userId: mongoose.Types.ObjectId | undefined = req.userId;
    try {
      const userId: mongoose.Types.ObjectId | undefined = req.userId;
      const user: UserType | null = await UserModel.findOne({
        _id: userId,
      });
      if (!user) {
        res.status(404).json({
          message: "User not found!",
        });
      }
      const isPasswordValid = await bcrypt.compare(
        oldPassword,
        user!.password!,
      );
      if (!isPasswordValid) {
        res.status(401).json({
          message: "Old password is incorrect!",
        });
        return;
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    } catch {}
  },
);

app.listen(process.env.PORT || PORT, () => {
  console.log("server is listening on port");
});
