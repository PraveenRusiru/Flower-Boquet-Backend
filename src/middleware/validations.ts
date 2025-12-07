import { body } from "express-validator";
import { Request,Response,NextFunction } from "express";
// import { AuthRequest } from "./auth";

export const validateEmail = (req: Request, res: Response, next: NextFunction) => { 
    const { email } = req.body
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  
  // Check if empty
  if (!email || email.trim() === '') {
    //   next()
      return res.status(400).json({message:"Can't be processed empty emials "});
      
  }
  // Check format
  if (!emailRegex.test(email)) {
      return res.status(400).json({message:"Invalid email format"});
      
  }
    
    return next();
    
    
}

export const validatePhoneLK=(req: Request, res: Response, next: NextFunction) => {
    const { phone } = req.body
    
    const phoneRegex = /^(?:0|94|\+94)?(?:7[01245678]\d{7}|[1-9]\d{8,9})$/

    if (!phone || phone.trim() === "") {
        return res.status(400).json({message:"Can't be processed empty phones "})
    }
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({message:"Invalid phone format"})
    }

    
    return next()

}

export const validateStrongPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password } = req.body as { password?: string };

  if (!password || password.trim() === '') {
    return res
      .status(400)
      .json({ message: "Password can't be empty" });
  }

  // At least 8 chars, 1 lowercase, 1 uppercase, 1 number, 1 special char
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({
      message:
        'Password must contain: min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 symbol',
    });
  }

  return next();
};