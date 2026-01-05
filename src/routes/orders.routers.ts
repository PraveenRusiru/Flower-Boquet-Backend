import { Router } from "express";

import { creeateOrder, getAllOrders, getOrders, updateOrderStatus } from "../controller/order.controller";
import { authenticate } from "../middleware/auth";

const orderRouter = Router();

orderRouter.post("/create",creeateOrder);
orderRouter.post("/get", authenticate,getOrders);
orderRouter.put("/updatestatus", authenticate, updateOrderStatus);
// orderRouter.delete("/delete", authenticate, deleteOrder);
orderRouter.get("/all", getAllOrders);

export default orderRouter;