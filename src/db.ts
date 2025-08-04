import mongoose from "mongoose";
const {Schema, model} = mongoose;
import dotenv from "dotenv"

dotenv.config();



async function main() {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
        throw new Error("MONGO_URL environment variable is not bhai");
    }
    await mongoose.connect(mongoUrl);
    
}

const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: String ,
    dateOfJoined: {
        type:Date,
        default: Date.now,
    }
  
})

export const UserModel = mongoose.model("Users", UserSchema);

const ContentSchema = new Schema ( {
    title:String,
    link: String,
    type: String,
    tags: [{type: mongoose.Types.ObjectId, ref: "Tag"}],
    userId: {type: mongoose.Types.ObjectId, ref: "Users"}
})

export const ContentModel = mongoose.model("Content", ContentSchema);


const LinkSchema = new Schema({
    hash: String,
    userId: {type: mongoose.Types.ObjectId, ref: "Users", required: true}

})

export const LinkModel = mongoose.model("Links", LinkSchema);
main();