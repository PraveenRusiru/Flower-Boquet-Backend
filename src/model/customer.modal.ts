import mongoose, { Document,Schema } from "mongoose";
export interface ICustomer extends Document { 
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
}
const customerSchema = new Schema<ICustomer>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true ,unique: true},
    address: { type: String, required: true },
}, { timestamps: true });

const Customer = mongoose.model<ICustomer>("Customer", customerSchema);

export default Customer;