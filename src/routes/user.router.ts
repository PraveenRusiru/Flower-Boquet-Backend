import { Router } from "express";
import { validateEmail,validatePhoneLK ,validateStrongPassword} from "../middleware/validations";
import { registerUser,login, UpdateUser,getData,changePassword,requestCode,forgetPasswordVerifyCode } from "../controller/user.controller";
import { authenticate } from "../middleware/auth";

const userRouter = Router()

userRouter.post("/register", validateEmail, validatePhoneLK, validateStrongPassword, registerUser)
userRouter.post("/login", validateEmail, login)
userRouter.put("/update",validateEmail,validatePhoneLK,authenticate,UpdateUser)
userRouter.get("/get", authenticate, getData)
userRouter.post("/changePw", authenticate, validateStrongPassword, changePassword)
// userRouter.post("/requestCode", authenticate, requestCode)
// userRouter.post("/verifyCode",authenticate,forgetPasswordVerifyCode)
export default userRouter