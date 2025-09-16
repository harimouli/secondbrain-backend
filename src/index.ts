import express from "express";
import { Response, Request, NextFunction } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt"

// Extend Express Request interface to include userId

import { AuthRequest } from "./middleware";

import { ObjectId } from "mongoose";
import jwt from  "jsonwebtoken"; 
import cors from "cors"
import { json } from "express/lib/response";

import { UserModel, ContentModel, LinkModel } from "./db"; 

import { random } from "./utils";

import { JWT_PASSWORD, SALT_ROUNDS } from "./config";
import { userMiddleware } from "./middleware";

import dotenv from "dotenv"
import { verify } from "crypto";
dotenv.config();

const PORT  =  3000;
const app = express();
app.use(express.json())
app.use(cors());





app.post("/api/v1/signup", async (req: Request, res: Response) => {
    try {
         const username = req.body.username;
         const password = req.body.password;

         const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
         const existingUser = await UserModel.findOne({
            username
         })
         if(existingUser) {
            res.send({
                message: "user already exists!"
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
            const username = req.body.username;
            const password = req.body.password;
            

            const existingUser =  await UserModel.findOne({
                username,
            })
            if(existingUser) {
                const isPasswordValid = await bcrypt.compare(password, existingUser.password!);

               
                const token = jwt.sign({
                    id: existingUser._id
                }, process.env.JWT_PASSWORD!, {expiresIn: "1d"});

                res.status(200).json({
                    token: "Bearer " + token,
                    message: "You are logged in!"
                })
            }else{
                res.status(401).json({
                    message: "Invalid username or password"
                })
            }

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
    const userId = req.userId;

    const content = await ContentModel.find({
        userId
    }).populate("userId", "username");

    res.json({
        content
    })

})

app.delete("/api/v1/content", userMiddleware,async (req: AuthRequest, res: Response)=> {
    const link = req.body.link;


    const userId = req.userId;
    try {
           const response =    await ContentModel.deleteOne({
                link,
                userId
            })
          
            res.json({
                message: "Deleted succesfully!"
            })


    }catch(err) {
        res.json({
            message: "Something went wrong!"
        })
    }

    


})

app.post("/api/v1/brain/share", userMiddleware,async (req: AuthRequest, res: Response) => {
    const {share} = req.body
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
          
            userId: req.userId
        });
        
        console.log(req.userId);
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
        const id = req.userId;
        const userId = new mongoose.Types.ObjectId(id);
       const userDetails = await UserModel.findOne({
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


app.post("/api/v1/verify-login", userMiddleware ,async (req: AuthRequest, res: Response) => {
    
    res.status(201).send({
        message: 
        "verified!"
    })
    
})
app.listen(process.env.PORT || PORT ,() => {
    console.log("server is listening on port");
})