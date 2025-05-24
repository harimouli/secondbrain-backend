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