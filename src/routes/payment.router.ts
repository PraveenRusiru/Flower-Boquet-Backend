import { Router } from "express";
import { deletePayment, processPayment, updatePaymentStatus } from "../controller/payment.controller";
import { authenticate } from "../middleware/auth";

const paymentRouter = Router();

paymentRouter.post("/process", authenticate,processPayment);
paymentRouter.put("/updatestatus", authenticate, updatePaymentStatus);
// paymentRouter.delete("/delete", authenticate, deletePayment);

export default paymentRouter;