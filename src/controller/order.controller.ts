import { Request, Response } from "express";
import OrderModel from "../model/Order.modal";

export const creeateOrder =async (req: Request, res: Response) => {
    const { customerId, items, totalAmount } = req.body;
    if (!customerId) {
        return res.status(400).json({ message: "Customer ID is required" });
    }
    console.log(items, totalAmount);
    
    if(!items || !totalAmount) {
        return res.status(400).json({ message: "Item details are required" });
    }
    try { 
        const order = {
            customerId,
            items: [
                {
                    productId: items.productId,
                    quantity: items.quantity,
                    price: items.price
                }
            ],
            totalAmount,
            orderDate: new Date(),
            status: "pending"
        };
        const placedorder = await OrderModel.create(order);
        return res.status(201).json({ message: "Order created successfully", order: placedorder });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
}
 
export const getOrders = async (req: Request, res: Response) => { 
    const { orderId } = req.body; 
    if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
    } 
    try {
        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        return res.status(200).json({ order });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
}
export const updateOrderStatus = async (req: Request, res: Response) => {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
        return res.status(400).json({ message: "Order ID and status are required" });
    }
    try {
        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        order.status = status;
        await order.save();
        return res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
}
export const deleteOrder = async (req: Request, res: Response) => {
    const { orderId } = req.body;
    if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
    }
    try {
        const order = await OrderModel.findByIdAndDelete(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        return res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
}
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await OrderModel.find();
        return res.status(200).json({ orders });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
}