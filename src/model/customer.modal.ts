import mongoose, { Document, Schema } from "mongoose";
import { IOTPMethods, otpPlugin } from "../plugin/otp_plugin";
export interface Cart { 
    productId: mongoose.Types.ObjectId;
    quantity: number;
    discount?: number;
}
export interface ICustomer extends Document, IOTPMethods {
    email: string;
}
export interface ICustomer extends Document { 
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    address: string;
    cart: Cart[];
    isVerified: boolean;
    orders: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
const customerSchema = new Schema<ICustomer>({
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false, unique: false },
    isVerified: { type: Boolean, default: false },
    address: { type: String, required: false },
    cart: { type: [{ productId: mongoose.Types.ObjectId, quantity: Number, discount: Number }], required: false },
    orders: { type: [mongoose.Types.ObjectId], required: false },
}, { timestamps: true });

customerSchema.index(
    { createdAt: 1 }, 
    { 
        expireAfterSeconds: 120, 
        partialFilterExpression: { isVerified: false } 
    }
);


customerSchema.plugin(otpPlugin)
const Customer = mongoose.model<ICustomer>("Customer", customerSchema);

export default Customer;