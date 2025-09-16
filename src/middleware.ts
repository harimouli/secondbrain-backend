import { Request, Response, NextFunction } from "express"

                                

    export interface AuthRequest extends Request {
      userId?: string;
    }
 

import dotenv from "dotenv"

dotenv.config();

import { JWT_PASSWORD } from "./config";

import jwt from "jsonwebtoken";

export const userMiddleware = (req: AuthRequest, res:Response, next: NextFunction) : void  => {
    const header = req.headers["authorization"];
    const authToken = header && header.split(" ")[1];


    if(!authToken){
         res.status(403).json({
            message: "You are not logged in!"
        })
        return;
    } 

    try {
        const decoded = jwt.verify(authToken as string, process.env.JWT_PASSWORD!) as { id: string };
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(403).json({
            message: "You are not logged in!"
        })
        return;
    }

    if(!req?.userId){
        res.status(403).json({
            message: "You are not logged in!"
        })
        return;
    }
}

