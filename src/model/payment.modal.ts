import mongoose, { Document, Schema } from "mongoose";

export interface PaymentDocument extends Document { 
    _id: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    amount: number;
    discount: number;
    status: string;
    paymentMethod: string;
    createdAt: Date;
    updatedAt: Date;
}
export enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMEPLETED",
    FAILED = "FAILED"
}
export enum PaymentMethod {
    CREDIT_CARD = "CREDIT_CARD",
    CASH = "CASH",
    BANK_TRANSFER = "BANK_TRANSFER"
}
const PaymentSchema = new Schema<PaymentDocument>(
    {
        orderId: { type: mongoose.Types.ObjectId, ref: "Order", required: true },
        amount: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
        paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
    },
    { timestamps: true }
);

const PaymentModel = mongoose.model<PaymentDocument>("Payment", PaymentSchema);
export default PaymentModel;