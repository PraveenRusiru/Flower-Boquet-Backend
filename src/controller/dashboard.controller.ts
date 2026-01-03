import Customer from "../model/customer.modal"
import Gift from "../model/gift.modal";
import OrderModel from "../model/Order.modal";
import { getAllCustomers } from "./customer.controller"
import { Request, Response } from "express";

export const getAllStats = async (req: Request, res: Response) => {
    try {
        const totalCustomers = await Customer.countDocuments();
        const totalProducts = await Gift.countDocuments();
        const totalActiveOrders = await OrderModel.countDocuments({ status: { $in: ['pending', 'shipped', 'processing'] } });
        const revenue = await OrderModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" }
                }
            }
        ]);
        const totalRevenue = revenue[0]?.totalRevenue || 0;

        res.status(200).json({
            totalCustomers,
            totalProducts,
            totalActiveOrders,
            totalRevenue
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" + error });
    }
}