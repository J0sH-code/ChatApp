import mongoose from "mongoose";

export const db = mongoose;

db.connect("mongodb://localhost:27017/chatProfiles");

const userProfileSchema = new mongoose.Schema({
    username: {type: String, required: true},
    age: {type: Number, required: true},
    email: {type: String, required: true}
})

export const profileModel = mongoose.model("User", userProfileSchema);