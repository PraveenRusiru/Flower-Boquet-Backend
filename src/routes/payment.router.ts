import { Router } from "express";
import { deletePayment, processPayment, updatePaymentStatus } from "../controller/payment.controller";

const paymentRouter = Router();

paymentRouter.post("/process", processPayment);
paymentRouter.put("/updatestatus", updatePaymentStatus);
// paymentRouter.delete("/delete", deletePayment);

export default paymentRouter;