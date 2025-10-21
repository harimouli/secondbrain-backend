import { Request, Response, NextFunction } from "express"

                                
import { UserModel } from "./db";
    export interface AuthRequest extends Request {
      userId?: mongoose.Types.ObjectId;
    }
 

import dotenv from "dotenv"

dotenv.config();

import { JWT_PASSWORD } from "./config";

import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { decode } from "punycode";

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
        const decoded: { id: string } = jwt.verify(authToken as string, process.env.JWT_PASSWORD!) as { id: string };
        
        if(!decoded) {
            res.status(403).json({
                message: "You are not logged in!"
            })
            return;
        }
        const id:string  = decoded.id;
        const userId = new mongoose.Types.ObjectId(decoded.id);
        req.userId = userId;   
        const user = await UserModel.findOne({ _id: userId });
     
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

