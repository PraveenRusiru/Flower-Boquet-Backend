import crypto from "crypto";
import { getRedisClient } from "../lib/redis";
// import { initRedis } from "..";



export const saveOTP = async (email: string) => {
    
    

   const code = crypto.randomBytes(Math.ceil(32 / 2))
    .toString("hex")
    .slice(0, 32);
    const client = await getRedisClient();
    // console.log("client",client);
    await client.setEx(`otp:${email}`, 300, code);
    
    // expires in 5 min
};

export const getOTP = async (email: string): Promise<string | null>  => {
  const client = await getRedisClient();
  return await client.get(`otp:${email}`);
};