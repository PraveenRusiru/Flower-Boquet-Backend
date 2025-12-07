import Router from "express"
import { createCustomer, deleteCustomer, getAllCustomers, getCustomer, updateCustomer } from "../controller/customer.controller"
import { authenticate } from "../middleware/auth";
import { validateEmail, validatePhoneLK } from "../middleware/validations";
const router = Router();

router.post("/create", authenticate, validateEmail, validatePhoneLK, createCustomer);
router.put("/update", authenticate, validateEmail, validatePhoneLK, updateCustomer);
router.post("/get", authenticate, getCustomer);
router.delete("/delete", authenticate, deleteCustomer);
router.get("/getAll", authenticate, getAllCustomers);

export default router;