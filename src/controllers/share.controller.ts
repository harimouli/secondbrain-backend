import { Response } from "express";
import { AuthRequest } from "../middleware/middleware";
import { LinkModel } from "../models/link.model";
import { UserModel } from "../models/user.model";
import { generateUrlHash } from "../utils";
import { ContentModel } from "../models/content.model";
export const shareUrlController = async (req: AuthRequest, res: Response) => {
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

      await UserModel.updateOne({ _id: req.userId }, { isShareEnabled: true }); // enabling sharing functionality for user in user collection..lol
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
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const shareStatusController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        isShareEnabled: false,
        message: "User not found!",
      });
      return;
    }
    res.status(200).json({
      success: true,
      isShareEnabled: user.isShareEnabled,
      message: "Share status fetched successfully!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      isShareEnabled: false,
      message: "Something went wrong!",
    });
  }
};

export const sharedContentController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const sharelink = req.params.sharelink;
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
};
