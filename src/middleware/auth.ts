import { Request,Response ,NextFunction} from "express"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
dotenv.config()

const JWT_ACEESSECRET = process.env.JWT_ACEESSECRET as string

export interface AuthRequest extends Request{
    user:any
}

interface JwtUserPayload extends jwt.JwtPayload {
  sub: string;
  // roles?: string[];
}


export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const header = (req as AuthRequest).headers.authorization

    if (!header) {
        return res.status(400).json({
            message:"Token missing"
        })
    }

    const token = header.split(" ")[1]
    try {
        const payload = jwt.verify(token, JWT_ACEESSECRET) as JwtUserPayload
        (req as AuthRequest).user = payload
        console.log("User verified",(req as AuthRequest).user,header)
         next()
    } catch (err) {
        console.error(err)
    res.status(401).json({
      message: "Invalid or expire token"
    })
    }
    




}