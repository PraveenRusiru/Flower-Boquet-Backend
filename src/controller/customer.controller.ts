import { Request, Response } from "express";
import Customer from "../model/customer.modal";
import { sendEmail } from "../util/mail";


export const requestCode = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        if (!email){
            return res.status(400).json({ message: "Email is required" });
        }
        let customer = await Customer.findOneAndUpdate(
        { email: email },
        { 
            $setOnInsert: { name: "New Customer1" } // Only set this if creating new
        }, 
        { new: true, upsert: true }
    );
        const code = await customer.generateOTP();
        sendEmail({
            to: email,
            subject: "Your Verification Code",
            text: `Your verification code is: ${code}. It will expire in 5 minutes.`,
        });

        return res.status(200).json({ message: "OTP sent successfully", code });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error"+error });
    }
}

export const verifyLoginOTP = async (req: Request, res: Response) => {
    const { email, code } = req.body;

    // 1. Find user + select hidden fields
    const customer = await Customer.findOne({ email })
        .select('+verificationCode +verificationCodeExpires');

    if (!customer) return res.status(404).json({ error: "customer not found" });

    // 2. Verify OTP (Using your plugin)
    const isValid = await customer.verifyOTP(code);
    if (!isValid) return res.status(400).json({ error: "Invalid Code" });

    // 3. Mark as verified (They are no longer "temporary")
    if (!customer.isVerified) {
        customer.isVerified = true;
    await customer.save();
    } 

    res.json({ 
        message: "Login successful",
        customer: {
            id: customer._id,
            email: customer.email,
            address: customer.address,
            name: customer.name,
            phone: customer.phone,
            cart: customer.cart,
        }   
    });
};


export const createCustomer = async (req: Request, res: Response) => { 
    const{ name, email, phone, address,cart } = req.body;
    try {
        if( !email ){
            return res.status(400).json({ message: "Email is required" });
        }
        
        const newCustomer = new Customer({
            name,
            email,
            phone,
            address,
            
        });
        await newCustomer.save();
        return res.status(201).json(newCustomer);
    } catch (error) {
        console.log("Internal server error",error);
        return res.status(500).json({ message: "Internal server error"+error });
    }
}
export const updateCustomer = async (req: Request, res: Response) => { 
    // Implementation for updating a customer
    const { customerId, name, email, phone, address } = req.body;
    try {
        if (!customerId) {
            console.log("Customer ID is required");
            return res.status(400).json({ message: "Customer ID is required" });
        }
        if (!name && !email && !address) {
            console.log("At least one field is required to update",name,email,address);
            return res.status(400).json({ message: "At least one field is required to update" });
        }
        const customer = await Customer.findById(customerId);
        if (!customer) {
            console.log("Customer not found");
            return res.status(404).json({ message: "Customer not found" });
        }
        customer.name = name || customer.name;
        customer.email = email || customer.email;
        customer.phone = phone || customer.phone;
        customer.address = address || customer.address;

        await customer.save();
        return res.status(200).json(customer);

    } catch (error) { 
        return res.status(500).json({ message: "Internal server error" });
    }
}
export const getCustomer = async (req: Request, res: Response) => {
    const { customerId } = req.body;
    try {
        if (!customerId) {
            return res.status(400).json({ message: "Customer ID is required" });
        }
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        return res.status(200).json(customer);
    }
    catch (error) { 
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteCustomer = async (req: Request, res: Response) => {
    const { customerId } = req.body;
    try {
        if (!customerId) {
            return res.status(400).json({ message: "Customer ID is required" });
        }
        const customer = await Customer.findByIdAndDelete(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        return res.status(200).json({ message: "Customer deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await Customer.find();
        return res.status(200).json(customers);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const addToCart = async (req: Request, res: Response) => { 
    const { customerId, productId, quantity, discount } = req.body;
    try {
        if (!customerId || !productId || !quantity) {
            return res.status(400).json({ message: "Customer ID, Product ID and quantity are required" });
        }
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        // Check if product already in cart
        const existingItemIndex = customer.cart.findIndex(item => item.productId.toString() === productId);
        if (existingItemIndex >= 0) {
            // Update quantity and discount
            customer.cart[existingItemIndex].quantity += quantity;
            if (discount) {
                customer.cart[existingItemIndex].discount = discount;
            }
        } else {
            // Add new item to cart
            customer.cart.push({ productId, quantity, discount });
        }
        await customer.save();
        return res.status(200).json(customer.cart);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
export const removeFromCart = async (req: Request, res: Response) => { 
    const { customerId, productId } = req.body;
    try {
        
        if (!customerId || !productId) {
            return res.status(400).json({ message: "Customer ID and Product ID are required" });
        }
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        // Remove item from cart
        customer.cart = customer.cart.filter(item => item.productId.toString() !== productId);
        await customer.save();
        return res.status(200).json(customer.cart);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
export const qtyChange = async (req: Request, res: Response) => { 
    const { customerId, productId, quantity } = req.body;
    try {
        if (!customerId || !productId || quantity === undefined) {
            return res.status(400).json({ message: "Customer ID, Product ID and quantity are required" });
        }
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        // Find item in cart
        const itemIndex = customer.cart.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not found in cart" });
        }
        // Update quantity
        customer.cart[itemIndex].quantity = quantity;
        await customer.save();
        return res.status(200).json(customer.cart);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}