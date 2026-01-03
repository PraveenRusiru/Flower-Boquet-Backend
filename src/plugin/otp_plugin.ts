import { Schema, Document } from "mongoose";
import crypto from "crypto";
import User from "../model/user.Modal";

// 1. Define the interface for the methods we are injecting
export interface IOTPMethods {
    generateOTP(): Promise<string>;
    verifyOTP(code: string): Promise<boolean>;
}

// 2. The Plugin Function
export const otpPlugin = (schema: Schema) => {
    
    // Inject Fields automatically
    schema.add({
        verificationCode: { 
            type: String, 
            select: false // Hide from normal queries
        },
        verificationCodeExpires: { 
            type: Date, 
            select: false 
        }
    });

    // Inject 'Generate' Method
    schema.methods.generateOTP = async function () {
        const code = crypto.randomInt(100000, 999999).toString();
        
        this.verificationCode = code;
        this.verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
        
        await this.save();
        return code;
    };

    // Inject 'Verify' Method
    schema.methods.verifyOTP = async function (inputCode: string) {
        // We must re-fetch the user to get the hidden fields if they aren't loaded
        // However, usually, you select them in the controller before calling this.
        
        // 1. Check matching code
        
        console.log("Stored Code:", this.verificationCode);
        console.log("Input Code:", inputCode);
        if (!this.verificationCode || this.verificationCode !== inputCode) {
            return false;
        }

        // 2. Check expiration
        if (!this.verificationCodeExpires || this.verificationCodeExpires < new Date()) {
            return false;
        }

        // 3. Clear code after success (prevent reuse)
        this.verificationCode = undefined;
        this.verificationCodeExpires = undefined;
        await this.save();

        return true;
    };
};
