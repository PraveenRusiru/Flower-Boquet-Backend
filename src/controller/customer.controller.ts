import { Request, Response } from "express";
import Customer from "../model/customer.modal";
export const createCustomer = async (req: Request, res: Response) => { 
    const{ name, email, phone, address } = req.body;
    try {
        if(!name || !email || !phone || !address){
            return res.status(400).json({ message: "All fields are required" });
        }
        const newCustomer = new Customer({
            name,
            email,
            phone,
            address
        });
        await newCustomer.save();
        return res.status(201).json(newCustomer);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
export const updateCustomer = async (req: Request, res: Response) => { 
    // Implementation for updating a customer
    const { customerId, name, email, phone, address } = req.body;
    try {
        if(!customerId){
            return res.status(400).json({ message: "Customer ID is required" });
        }
        if(!name && !email && !phone && !address){
            return res.status(400).json({ message: "At least one field is required to update" });
        }
        const customer = await Customer.findById(customerId);
        if(!customer){
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