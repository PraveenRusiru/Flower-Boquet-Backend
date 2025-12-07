import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import { IUser } from "../model/user.Modal"
dotenv.config()

const JWT_ACEESSECRET = process.env.JWT_ACEESSECRET as string
const JWT_REFRESHSECRET = process.env.JWT_REFRESHSECRET as string

export const signAccessToken = (user: IUser): string => {
    return jwt.sign(
        {
            sub: user._id.toString()
        },
        JWT_ACEESSECRET
        , {
            expiresIn:"30m"
        }
    ) 
}

export const signRefreshToken = (user: IUser): string => {
    return jwt.sign({
            sub:user._id.toString
    },
        JWT_REFRESHSECRET,
        {
        expiresIn:"7d"
    }) 
}
