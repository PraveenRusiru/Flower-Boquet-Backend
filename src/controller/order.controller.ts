import { Request, Response } from "express";
import OrderModel from "../model/Order.modal";
import Customer from "../model/customer.modal";
import { sendEmail } from "../util/mail";
import Gift from "../model/gift.modal";
import { ObjectId } from "mongodb";

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
            items,
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
        const newOrder = await order.save();
        
        const cusId = newOrder.customerId;
        console.log("Customer ID:", cusId);
        const cus = await Customer.findOne(cusId);
        
        const email = cus?.email;
        console.log("Fetched Customer Email:", cus,email);
        if (!email) {
            return res.status(404).json({ message: "Customer email not found" });
        }
        console.log("Customer Email:", email);
        await sendEmail({
            to: cus.email,
            subject: "Order Status Updated",
                html: `<p>Your order with ID: <strong>${orderId}</strong> has been updated to status: <strong>${status}</strong>.</p>`,
            }
        );
        return res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        console.log("Internal Server Error", error);
        return res.status(500).json({ message: "Internal Server Error"+ error });
    }
}
// export const deleteOrder = async (req: Request, res: Response) => {
//     const { orderId } = req.body;
//     if (!orderId) {
//         return res.status(400).json({ message: "Order ID is required" });
//     }
//     try {
//         const order = await OrderModel.findByIdAndDelete(orderId);
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }
//         return res.status(200).json({ message: "Order deleted successfully" });
//     } catch (error) {
//         return res.status(500).json({ message: "Internal Server Error", error });
//     }
// }
export const getAllOrders = async (req: Request, res: Response) => {
    type orderItem = {
        giftName: String,
        giftQty: Number
    }
    type orderDetails = {
        _id: ObjectId,
        customerId: ObjectId,
        items: orderItem[],
        totalAmount: Number,
        orderDate: Date,
        status: String,
    }
            try {
                        const orders = await OrderModel.find();

                const ordersDetails: orderDetails[] = await Promise.all(
                orders.map(async (order) => {
                    const itemsDetails: orderItem[] = await Promise.all(
                    order.items.map(async (item) => {
                        // If productId is an ObjectId, use findById (recommended)
                        const gift = await Gift.findById(item.productId);

                        if (!gift) {
                        // you can throw here and catch above
                        throw new Error("Gift not found");
                        }

                        return {
                        giftName: gift.name,
                        giftQty: item.quantity,
                        };
                    })
                    );

                    return {
                    _id: order._id,
                    customerId: order.customerId,
                    items: itemsDetails,
                    totalAmount: order.totalAmount,
                    orderDate: order.orderDate,
                    status: order.status,
                    };
                })
                );

                console.log("ordersDetails", ordersDetails);


        return res.status(200).json( ordersDetails );
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
}