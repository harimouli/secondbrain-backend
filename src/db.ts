import mongoose from "mongoose";
const {Schema, model} = mongoose;


async function main() {
    await mongoose.connect("mongodb+srv://harimoulimuthyala:dbUserPassword@cluster0.nrzfaps.mongodb.net/brainly");

}

const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: String    
})

export const UserModel = mongoose.model("Users", UserSchema);

const ContentSchema = new Schema ( {
    title:String,
    link: String,
    type: String,
    tags: [{type: mongoose.Schema.ObjectId, ref: "Tag"}],
    userId: {type: mongoose.Schema.ObjectId, ref: "Users"}
})

export const ContentModel = mongoose.model("Content", ContentSchema);

main();