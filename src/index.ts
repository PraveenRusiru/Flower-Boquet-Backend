import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import userRouter from "./routes/user.router"
import { getRedisClient } from "./lib/redis"; // clean separation
import giftRouter from "./routes/gift.router";
import customerRouter from "./routes/customer.router";
import orderRouter from "./routes/orders.routers";
import paymentRouter from "./routes/payment.router";
import libraryRouter from "./routes/library.router";
import aiRouter from "./routes/ai.router";
import dashboardRouter from "./routes/dashboard.router";
import cors from "cors";
dotenv.config()

const MONGO_URI = process.env.MONGO_URI as string
const PORT = process.env.PORT

const app = express()

// Connect Redis on startup (once)
// export const initRedis = async () => {
//   try {
//     await getRedisClient();
//     console.log("Redis ready");
//   } catch (err) {
//     console.error("Redis connection failed:", err);
//     process.exit(1); // exit if Redis is critical
//   }
// };
 


// const allowedOrigins = ['https://flower-boquet-frontend.vercel.app/']; // add your allowed origins here
app.use(cors({
  origin: ['https://flower-boquet-frontend.vercel.app',"http://localhost:8080"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json())
app.use("/api/v1/auth", userRouter)
app.use("/api/v1/gift", giftRouter)
app.use("/api/v1/customer", customerRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/library", libraryRouter);
app.use("/api/v1/ai", aiRouter); 
app.use("/api/v1/dashboard", dashboardRouter);

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("DB is Connected")
    })
    .catch((err) => {
        console.log("DB isn't connected :", err)
        process.exit(1)
    })

app.listen(PORT, () => {
    console.log("Server is connected  ")
})
