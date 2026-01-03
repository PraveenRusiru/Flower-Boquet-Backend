import { Request ,Response } from "express"
import User from "../model/user.Modal"
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"
import { signAccessToken, signRefreshToken } from "../util/token"
import { AuthRequest } from "../middleware/auth"
import { sendEmail } from "../util/mail"

const JWT_REFRESH_SECRET = process.env.JWT_REFRESHSECRET as string

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password } = req.body
        const existEmail = await User.findOne({ email })
        if (existEmail) {
          return  res.status(400).json({
                message:"email exist"
            })
        }
        const existPhone = await User.findOne({phone})
        if (existPhone) {
          return  res.status(400).json({
                message:"Phone exist"
            })
        }
        
        const hashPw = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            email,
            phone,
            password:hashPw
        })
        
        
        // const subject = "welcome"
        await sendEmail({
                    to: email,
                    subject: "Welcome to Flower Pots Shop",
                    html: `<h1>Hi ${name}</h1><p>Thanks for registering!</p>`,
                })
        res.status(200).json({
            message: "User registered successfully",
            data:user
        })

    } catch (err) {
        console.log("Internal server error", err)
        res.status(500).json({
            message:"Internal server error"
        })
    }
    
}

export const login = async (req: Request, res: Response) => {
    try{const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return   res.status(400).json({
                message:"Email not registered"
            })
        }
        if (password.trim() === "" || !password) {
            return res.status(400).json({
                message:"Password required"
            })
        }
        const valid = await bcrypt.compare(password, user?.password)
        console.log("user", user)
        if (!valid) {
            return res.status(400).json({
                message:"Password and email don't match or password incorrect"
            })

        }

        const accessToken = signAccessToken(user)
        const refreshToken = signRefreshToken(user)
        

        await sendEmail({
                    to: email,
                    subject: "Logged in to Flower Pots Shop",
                    html: `<h1>Hi </h1><p>Thanks for registering!</p>`,
                })

        res.status(200).json({ message: "Login success", accessToken:accessToken ,refreshToken:refreshToken })
    } catch (err) {
        console.log("Internal server error", err)
        res.status(500).json({message:"Internal server error"+err})
    }
    
}

export const UpdateUser = async(req: Request, res: Response) => {
    const { name, email, phone } = req.body
    if (!name || !email || !phone) {
        return res.status(400).json({
            message:"Fields can't be empty"
        })
    }
    
    console.log("userid", (req as AuthRequest).user.sub)
    const userId= (req as AuthRequest).user.sub 
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, {
            name,
            email,
            phone
        },{ new: true, runValidators: true})
        res.status(200).json({
            message: "User updated successfully !",
            user:updatedUser
        })
    } catch (err) {
        console.log("Internal server error",err)
        res.status(500).json({message:"Internal server error"+err})
    }
}

export const getData = async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user.sub 
    
    try {
        const user = await User.findById(userId)
        res.status(200).json({
        message:user
    })
    } catch (err) {
        res.status(500).json({
        message:"Internal server error"+err
    })
    }
    
}

export const changePassword = async (req: Request, res: Response) => {
    const { password,newPassword,ConfirmPassword } = req.body
    const userId = (req as AuthRequest).user.sub
    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({
            message:"User can't be found"
        })
        }

        if (newPassword != ConfirmPassword) {
            return res.status(400).json({
                 message: "Password doesn't match",
                 
        })    
        }

        const valid = await bcrypt.compare(password,user.password )
        if (!valid) {
            return res.status(400).json({
                message: "Password doesn't match",
                 
            })
        }
        const hashNewPw = await bcrypt.hash(newPassword, 10)
        const updatedPw = await User.findByIdAndUpdate(userId, {
            password:hashNewPw            
        },{ new: true, runValidators: true})
        res.status(200).json({
            message: "User updated successfully !",
            user:updatedPw
        })
        

            
        
    }catch (err) {
        console.log("Internal server error", err)
        res.status(400).json({
            message:"internal server error"+err
        })
    }
}

export const requestCode = async (req: Request, res: Response) => {
    const { email } = req.body
    
    if(!email){
        return res.status(400).json({
            message:"Email is required"
        })
    }
    const user =await User.findOne({email})
    if(!user){
        return res.status(400).json({
            message:"Email not registered"
        })
    }


    const code = await user.generateOTP()
    
    await sendEmail({
                    to: email,
                    subject: "Logged in to Flower Pots Shop",
                    html: `<h1>Hi </h1><p>Password reset otp is ${code}</p>`,
    })
    
    res.status(200).json({
        message:"Code has been sent "+code
    })
}

export const forgetPasswordVerifyCode = async (req: Request, res: Response) => {
    const { enteredCode ,email} = req.body

    if(!email){
        return res.status(400).json({
            message:"Email is required"
        })
    }
    const user = await User.findOne({ email }).select('+verificationCode +verificationCodeExpires');
    if(!user){
        return res.status(400).json({
            message:"Email not registered"
        })
    }

    const isValid = await user.verifyOTP(enteredCode)
    if(!isValid){
        return res.status(400).json({
            message:"Invalid or expired code"
        })
    }

    await User.findByIdAndUpdate(user._id, {
        password:""
    },{new:true})

    res.status(200).json(
            {
                message:"Password has been reset"
            }
        )
}

export const setNewPassword = async (req: Request, res: Response) => {
    const { email,password,ConfirmPassword } = req.body

    if(!email){
        return res.status(400).json({
            message:"Email is required"
        })
    }
    const user = await User.findOne({ email });
    if(!user){
        return res.status(400).json({
            message:"Email not registered"
        })
    }

    if (password != ConfirmPassword) {
        return res.status(400).json({
             message: "Password doesn't match",
             
    })    
    }

    const hashNewPw = await bcrypt.hash(password, 10)
    const updatedPw = await User.findByIdAndUpdate(user._id, {
        password:hashNewPw            
    },{ new: true, runValidators: true})
    res.status(200).json({
        message: "Password updated successfully !",
        user:updatedPw
    })
}

export const handleRefreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return res.status(400).json({ message: "Token required" })
    }
      // import jwt from "jsonwebtoken"
      console.log("refreshToken", refreshToken)
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
      // payload.sub - userID
      console.log("payload", payload,"sub", payload.sub)
      const user = await User.findById(payload.sub)
      console.log("user", user)
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" })
    }
    const accessToken = signAccessToken(user)
    res.status(200).json({ accessToken })
  } catch (err) {
    res.status(403).json({ message: "Invalid or expire token" })
  }
}