import { Router } from "express";

import { creeateOrder, getAllOrders, deleteOrder, getOrders, updateOrderStatus } from "../controller/order.controller";

const orderRouter = Router();

orderRouter.post("/create", creeateOrder);
orderRouter.post("/get", getOrders);
orderRouter.put("/updatestatus", updateOrderStatus);
orderRouter.delete("/delete", deleteOrder);
orderRouter.get("/all", getAllOrders);

export default orderRouter;