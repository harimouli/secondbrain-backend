import express from "express";
import mongoose from "mongoose";
import jwt from  "jsonwebtoken"; 
import { json } from "express/lib/response";

import { UserModel, ContentModel, LinkModel } from "./db"; 

import { random } from "./utils";

import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
const app = express();
app.use(express.json())




app.post("/api/v1/signup", async (req, res) => {
   //TODO  //zod validation , hash password


    const username = req.body.username;
    const password = req.body.password;

    try {
         await UserModel.create({
            username: username,
            password: password
         })

         res.status(200).json({
            message: "User signed up"
         })

    }catch(err) {
        res.status(411).json({
            message: "user already exists"
        })
        
    }

})

app.post("/api/v1/signin", async (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const existingUser =  await UserModel.findOne({
        username,
        password
    })
    if(existingUser) {
        const token = jwt.sign({
            id: existingUser._id
        }, JWT_PASSWORD);

        res.status(200).json({
            token
        })
    }else{
        res.status(401).json({
            message: "Incorrect credentials"
        })
    }




})

app.post("/api/v1/content", userMiddleware,async(req, res) => {
        const link = req.body.link;
        const title = req.body.title;
        const type = req.body.type
        //@ts-ignore
        const userId = req.userId;

        try {
            await ContentModel.create({
                title,
                link,
                type,
                //@ts-ignore
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

app.get("/api/v1/content", userMiddleware,async (req, res) => {
    //@ts-ignore
    const userId = req.userId;

    const content = await ContentModel.find({
        userId
    }).populate("userId", "username");

    res.json({
        content
    })

})

app.delete("/api/v1/content", userMiddleware,async (req, res)=> {
    const contentId = req.body.contentId;
    //@ts-ignore
    const userId = req.userId;
    await ContentModel.deleteOne({
        contentId,
        userId
    })

    res.json({
        message: "Deleted!"
    })


})

app.post("/api/v1/brain/share", userMiddleware,async (req, res) => {
    const {share} = req.body
    if(share) {

        const existingLink = await LinkModel.findOne({
            //@ts-ignore
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
            //@ts-ignore
            userId: req.userId,
            hash: hash
       })
        res.status(200).json({
        hash: hash
    })

    }else{
        await LinkModel.deleteOne({
            //@ts-ignore
            userId: req.userId
        });
        //@ts-ignore
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


app.listen(3000, () => {
    console.log("server is listening on port");
})