import { Request, Response, NextFunction } from "express"

import dotenv from "dotenv"

dotenv.config();

import { JWT_PASSWORD } from "./config";

import jwt from "jsonwebtoken";

export const userMiddleware = (req: Request, res:Response, next: NextFunction) => {
    const header = req.headers["authorization"];

    const decoded = jwt.verify(header as string, process.env.JWT_PASSWORD!);
    
    if(decoded){
        //@ts-ignore
        req.userId = decoded.id
        next();
    }
    else{
        res.status(403).json({
            message: "You are not logged in!"
        })
        
    }
}

//overide the express types bro , i know what iam doing