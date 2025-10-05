import { Request, Response, NextFunction } from "express"

                                
import { UserModel } from "./db";
    export interface AuthRequest extends Request {
      userId?: string;
    }
 

import dotenv from "dotenv"

dotenv.config();

import { JWT_PASSWORD } from "./config";

import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const userMiddleware =  async (req: AuthRequest, res:Response, next: NextFunction) : Promise<void>  => {
    

    try {


         const header = req.headers["authorization"];
        const authToken = header && header.split(" ")[1];   
       
    if(!authToken){
         res.status(403).json({
            message: "You are not logged in!"
        })
        return;
    } 
        const decoded = jwt.verify(authToken as string, process.env.JWT_PASSWORD!) as { id: string };
      
        if(!decoded) {
            res.status(403).json({
                message: "You are not logged in!"
            })
            return;
        }
        req.userId = decoded.id;
        const userId = new mongoose.Types.ObjectId(decoded.id);
        const user = await UserModel.findOne({ _id: userId });
        console.log(user);
        if(!user) {
            res.status(401).json({
                message: "You are not logged in!"
            })
            return;
        }
        next();
    } catch (error) {
        res.status(403).json({
            message: "something went wrong!"
        })
        return; 
    }

}

