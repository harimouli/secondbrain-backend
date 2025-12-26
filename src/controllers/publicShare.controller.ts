import { Response } from "express";
import { AuthRequest } from "../middleware/middleware";
import { LinkModel } from "../models/link.model";
import { ContentModel } from "../models/content.model";

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
