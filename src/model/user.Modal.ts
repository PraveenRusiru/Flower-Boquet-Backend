import mongoose, { Document, Mongoose, Schema } from "mongoose";
import { otpPlugin,IOTPMethods } from "../plugin/otp_plugin";
// import { nanoid } from "nanoid";
export interface IUser extends Document, IOTPMethods {
    name: string;
    email: string;
    // No need to define verificationCode fields here manually
}
export interface IUser extends Document{
    _id: mongoose.Types.ObjectId
    name: string;
    email: string;
    phone?: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String , required: false ,unique: true},
    password: { type: String, required: true },
}, { timestamps: true });

userSchema.plugin(otpPlugin)
const User = mongoose.model<IUser>("User", userSchema);

export default User;