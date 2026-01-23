import { Response } from "express";
import { AuthRequest } from "../middleware/middleware";
import { ContentModel } from "../models/content.model";
import mongoose from "mongoose";
export const addContentController = async (req: AuthRequest, res: Response) => {
  const { link, title, type } = req.body;
  const userId = req.userId;
  console.log(req.body);

  try {
    await ContentModel.create({
      title,
      link,
      type,
      userId,
    });

    res.status(201).json({
      success: true,
      message: "Content added successfully!",
    });
  } catch (err) {
    console.log(err);
    res.status(501).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

export const userContentController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;
    const content = await ContentModel.find({
      userId,
    });

    res.status(200).json({
      message: "Content fetched successfully!",
      content,
      success: true,
    });
  } catch {
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

export const shareContentController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { share } = req.body;

    if (typeof share !== "boolean") {
      res.status(400).json({
        success: false,
        message: "Invalid share value!",
      });
      return;
    }
    const contentId = new mongoose.Types.ObjectId(req.params.contentId);
    const userId = req.userId;

    await ContentModel.updateOne({ _id: contentId, userId: userId }, { share });

    res.status(200).json({
      success: true,
      message: "content share status updated",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

export const contentDeleteController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const contentId = req.params.contentId;
    const userId: mongoose.Types.ObjectId | undefined = req?.userId;

    await ContentModel.deleteOne({
      _id: contentId,
      userId: userId,
    });

    res.status(200).json({
      success: true,
      message: "Deleted succesfully!",
    });
  } catch (err) {
    res.status(403).json({
      message: "Something went wrong!",
    });
  }
};
