import mongoose, { Document, mongo, Schema } from "mongoose";

export enum OrderStatus {
    PENDING = 'pending',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

export interface IOrder extends Document {
    _id: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    items: Array<{
        productId: mongoose.Types.ObjectId;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    orderDate: Date;
    status: OrderStatus;
}

const OrderSchema: Schema = new Schema<IOrder>({
    customerId: { type: mongoose.Types.ObjectId, required: true, ref: 'Customer' },
    items: [
        {
            productId: { type: mongoose.Types.ObjectId, required: true, ref: 'Gift' },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING }
});

const OrderModel = mongoose.model<IOrder>('Orders', OrderSchema);

export default OrderModel;
