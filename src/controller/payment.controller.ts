import { Request, Response } from "express";
import PaymentModel from "../model/payment.modal";

export const processPayment = async (req: Request, res: Response) => {
    const { orderId, amount, discount, paymentMethod } = req.body;
    // Payment processing logic would go here
    console.log(!orderId, !amount, discount, !paymentMethod);
    if (!orderId || !amount || discount === undefined || !paymentMethod) {
        return res.status(400).json({ message: "Missing required payment fields",orderId, amount, discount, paymentMethod });
    }
    // Simulate payment processing
    const paymentResult = {
        orderId,
        amount,
        discount,
        status: "PENDING",
        paymentMethod,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    await PaymentModel.create(paymentResult);
    return res.status(201).json({ message: "Payment processed successfully", payment: paymentResult });
}

export const updatePaymentStatus = async (req: Request, res: Response) => {
    const { paymentId,status } = req.body;
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) { 
        return res.status(404).json({ message: "Payment not found" });
    }
    if (!paymentId) {
        return res.status(404).json({ message: "Payment not found" });
    }
    payment.status=status;
    await payment.save();
    return res.status(200).json({ message: "Payment status updated successfully", payment });
}

export const deletePayment = async (req: Request, res: Response) => {
    const { paymentId } = req.body;
    const payment = await PaymentModel.findByIdAndDelete(paymentId);
    if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
    }
    return res.status(200).json({ message: "Payment deleted successfully" });
}