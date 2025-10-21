import express from "express";
import { Response, Request, NextFunction } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt"
import {  UserSchema } from "./db";
import {type InferSchemaType } from "mongoose";

// Extend Express Request interface to include userId
type UserType = InferSchemaType<typeof UserSchema>;


import { AuthRequest } from "./middleware";

import { ObjectId } from "mongoose";
import jwt from  "jsonwebtoken"; 
import cors from "cors"


import { UserModel, ContentModel, LinkModel } from "./db"; 

import { random } from "./utils";

import { JWT_PASSWORD, SALT_ROUNDS } from "./config";
import { userMiddleware } from "./middleware";

import dotenv from "dotenv";
dotenv.config();

const PORT  =  3000;
const app = express();
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:5173" , "https://secondbrain-frontend-gstt.vercel.app", "https://secondbrain-frontend-snowy.vercel.app"],
    
}));





app.post("/api/v1/signup", async (req: Request, res: Response) => {
    try {
         const username = req.body.username;
         const password = req.body.password;

         const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
         const existingUser = await UserModel.findOne({
            username
         })
         if(existingUser) {
            res.status(201).send({
                message: "user already exists! please signin"
            })

            return;
         }
         await UserModel.create({
            username: username,
            password: hashedPassword
         })
         res.send({
            message: "you are signed up!"
         })
    }catch(err) {
        res.status(500).json({
            message: "something went wrong!"
        })
        return;
        
    }
})

app.post("/api/v1/signin", async (req: Request, res: Response) => {

   try{
            const username: string = req.body.username;
            const password: string = req.body.password;
        
            const existingUser =  await UserModel.findOne({
                username,
            })

            if(!existingUser) {
                res.status(401).json({
                    message: "Invalid username or password!"
                })
                return;
            }
            
            const isPasswordValid = await bcrypt.compare(password, existingUser.password!);
            if(!isPasswordValid) {
                res.status(401).json({
                    message: "Invalid password! or username"
                })
                return;
            }
               
                const token = jwt.sign({
                    id: existingUser._id
                }, process.env.JWT_PASSWORD!, {expiresIn: "1d"});

                res.status(200).json({
                    token: token ,
                    message: "You are logged in!"
                })
   }catch {
        res.status(500).json({
            message: "something went wrong!"
        })
   }



})

app.post("/api/v1/content", userMiddleware,async(req: AuthRequest, res: Response) => {
        const link = req.body.link;
        const title = req.body.title;
        const type = req.body.type

        const userId = req?.userId;

        try {
            await ContentModel.create({
                title,
                link,
                type,
                userId
            })
        }catch(err){
            res.status(501).json({
                message: "Something went wrong!"
            })
        }

        res.status(200).json({
            message: "Content added!"
        })

})

app.get("/api/v1/content", userMiddleware,async (req: AuthRequest, res: Response) => {
    const userId: mongoose.Types.ObjectId | undefined = req.userId;


    try {
            const userId = req.userId;
            const content = await ContentModel.find({
                    userId
                 }).populate("userId", "username");

                res.status(200).json({
                    content
                })
            }catch{
                res.status(500).json({
                    message: "Something went wrong!"
                })
            }
      
})

app.delete("/api/v1/content", userMiddleware,async (req: AuthRequest, res: Response)=> {
    const link = req.body.link;
    const   userId: mongoose.Types.ObjectId | undefined=  req?.userId;
    try {
           const response =    await ContentModel.deleteOne({
                link,
                userId
            })

            res.status(200).json({
                message: "Deleted succesfully!"
            })


    }catch(err) {
        res.status(403).json({
            message: "Something went wrong!"
        })
    }

    


})

app.post("/api/v1/brain/share", userMiddleware,async (req: AuthRequest, res: Response) => {
    const {share} = req.body
      const   userId: mongoose.Types.ObjectId | undefined=  req?.userId;
    if(share) {

        const existingLink = await LinkModel.findOne({
            userId: req.userId
        })
        if(existingLink) {
            res.status(200).json({
                hash: existingLink.hash
            })
            return;
        }
        const hash = random(10);

       await  LinkModel.create({
            userId: req.userId,
            hash: hash
       })
        res.status(200).json({
        hash: hash
    })

    }else{
        await LinkModel.deleteOne({
          
            userId:userId
        });
        
      
        res.json({
            message: "Removed Link!"
        })
    }
   

})

app.get("/api/v1/brain/:shareLink", async (req, res)=> {
        const hash = req.params.shareLink;
      
    const link = await LinkModel.findOne({
        hash
    })

    if(!link) {

        res.status(404).json({
            message: "Sorry incorrect input!"
        })
        return;
    }
    const userId = link.userId;
    const content = await ContentModel.find({
        userId
    }).populate("userId", "username")
    /*if(!user) {
        res.status(411).json({
            message: "user not found , should ideally not happen!"   // written by sniper at code ... mouli
        })
        return;
    } */

    res.status(200).json({  
        content
    })

})

app.post("/api/v1/user-meta-data", userMiddleware, async (req: AuthRequest, res: Response)=> {


    try {
          const   userId: mongoose.Types.ObjectId | undefined=  req?.userId;
       const userDetails: UserType | null = await UserModel.findOne({
            _id: userId
       })
         if(!userDetails) {
                res.status(404).json({
                 message: "User not found!"
                })
                return;
         }
       res.json({
        username: userDetails?.username,
        dateOfJoined: userDetails?.dateOfJoined
       })
        
    }catch {
            res.status(500).json("something went wrong!")
    }
})


app.get("/api/v1/verifylogin", userMiddleware ,async (req: AuthRequest, res: Response) => {
    
   
    
    res.status(200).send({
        message: "verified!"
    })
    
});

app.post("/api/v1/change-password", userMiddleware, async (req: AuthRequest, res:Response) => {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const userId: mongoose.Types.ObjectId | undefined = req.userId;
    try {
          const userId: mongoose.Types.ObjectId | undefined = req.userId;
          const user: UserType | null  = await UserModel.findOne( {
            _id: userId
          });


    }catch {

    }

})


app.listen(process.env.PORT || PORT ,() => {
    console.log("server is listening on port");
})