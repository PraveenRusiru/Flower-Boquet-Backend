import Router from "express"
import { addToCart, createCustomer, deleteCustomer, getAllCustomers, getCustomer, qtyChange, removeFromCart, requestCode, updateCustomer, verifyLoginOTP } from "../controller/customer.controller"
import { authenticate } from "../middleware/auth";
import { validateEmail, validatePhoneLK } from "../middleware/validations";
const router = Router();

router.post("/create", validateEmail, validatePhoneLK, createCustomer);
router.post("/requestCode", requestCode);
router.post("/verifyCode", verifyLoginOTP);
router.post("/addtoCart", addToCart);
router.delete("/removeFromCart", removeFromCart);
router.post("/changeQty", qtyChange);
router.put("/update", authenticate, validateEmail, validatePhoneLK, updateCustomer);
router.post("/get", authenticate, getCustomer);
router.delete("/delete", authenticate, deleteCustomer);
router.get("/getAll", authenticate, getAllCustomers);

export default router;