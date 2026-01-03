import { Request, Response } from 'express';
import Gift, { IMediaUrl } from '../model/gift.modal';
import cloudinary from '../config/cloudinary';

export const createGift = async (req: Request, res: Response) => { 
    const { name, description, price, colour, size, category } = req.body;
    console.log(!name, !description, !price, !colour, !size, !category );
    
    if (!name  || !price || !size || !colour || !category || !req.files) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    if(!price || price <= 0){
        return res.status(400).json({ message: "Price must be a positive number" });
    }
    // if(!Array.isArray(category)){
    //     return res.status(400).json({ message: "Category must be a non-empty array" });
    // }
    // if(!Array.isArray(mediaUrl) || mediaUrl.length === 0){
    //     return res.status(400).json({ message: "MediaUrl must be a non-empty array" });
    // }
    try { 
       const imageURLs: any[] = [];

    const files = req.files as Express.Multer.File[] | undefined;
            console.log("Files in request:", files);
        if (files && files.length > 0) {
        console.log("Files received:", files.length);
            for (const file of files) {
          console.log("Uploading file:", file.originalname);
        const result: any = await new Promise((resolve, reject) => {
          const upload_stream = cloudinary.uploader.upload_stream(
            { folder: "posts" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
            upload_stream.end(file.buffer);
            console.log("Uploaded file:", file.originalname);
        });

        imageURLs.push({ url: result.secure_url, public_id: result.public_id } );
      }
    }

    if (imageURLs.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const newGift = new Gift({
      name,
      description,
      price,
      colour,
      size,
      category,
      mediaUrl: imageURLs, // schema: [String]
    });

    await newGift.save();
    return res.status(201).json(newGift);
  }catch (error) {
        return res.status(500).json({ message: "Internal server error"+error });
    }
}

export const updateGift = async (req: Request, res: Response) => { 
    const { giftId, name, description, price, colour, size, category } = req.body;
    try { 
        const gift = await Gift.findById(giftId);
        if(!gift){
            return res.status(404).json({ message: "Gift not found" });
        }

        gift.name = name || gift.name;
        gift.description = description || gift.description;
        gift.price = price || gift.price;
        gift.colour = colour || gift.colour;
        gift.size = size || gift.size;
        gift.category = category || gift.category;

        await gift.save();
        return res.status(200).json(gift);
    }catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }

}

export const updateImages = async (req: Request, res: Response) => { 
    const { giftId } = req.body;
    console.log("Request body:", req.body);
    try {
        const gift = await Gift.findById(giftId);
        if (!gift) {
            return res.status(404).json({ message: "Gift not found" });
        }
        console.log("Gift found:",gift.mediaUrl);
        const mediaUrls = gift.mediaUrl;
           const files = req.files as Express.Multer.File[] | undefined;

        // UPLOAD NEW IMAGES
        const newMediaUrls: IMediaUrl[] = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const result: any = await new Promise((resolve, reject) => {
                    const upload_stream = cloudinary.uploader.upload_stream(
                        { 
                            folder: "posts",
                        },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    upload_stream.end(file.buffer);
                });

                newMediaUrls.push({
                    url: result.secure_url,
                    public_id: result.public_id
                });
            }
        }
        console.log("New media URLs:", newMediaUrls);
        // UPDATE DATABASE with new media
        mediaUrls.push(...newMediaUrls);
        gift.mediaUrl = mediaUrls;

         const updatedGift = await Gift.findByIdAndUpdate(giftId, { mediaUrl: mediaUrls }, { new: true });
        console.log("Gift updated with new images:", updatedGift);
        return res.status(200).json({
            message: "Images updated successfully",
            gift: updatedGift
        });

    } catch (error) {
        console.error("Error updating images:", error);
        return res.status(500).json({ message: "Internal server error"+error });
    }
}

export const deleteImage = async (req: Request, res: Response) => {
    const { giftId, publicId } = req.body; // publicId from URL or body
    
    try {
        const gift = await Gift.findById(giftId);
        if (!gift) {
            return res.status(404).json({ message: "Gift not found" });
        }

        // Find the specific image by public_id
        const imageIndex = gift.mediaUrl.findIndex(media => media.public_id === publicId);
        
        if (imageIndex === -1) {
            return res.status(404).json({ message: "Image not found" });
        }

        // 1. DELETE from Cloudinary
        const deleteResult = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary delete result:", deleteResult);

        // 2. REMOVE from MongoDB array
        gift.mediaUrl.splice(imageIndex, 1);
        await gift.save();

        return res.status(200).json({
            message: "Image deleted successfully",
            deletedPublicId: publicId,
            remainingImages: gift.mediaUrl.length
        });

    } catch (error) {
        console.error("Delete image error:", error);
        return res.status(500).json({ message: "Delete failed" });
    }
};

export const getGifts = async (req: Request, res: Response) => { 
    const { giftId } = req.body;
    try {
        const gift = await Gift.findById(giftId);
        if(!gift){
            return res.status(404).json({ message: "Gift not found" });
        }
        return res.status(200).json(gift);
    }catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllGifts = async (req: Request, res: Response) => { 
    try {
        const gifts = await Gift.find();
        return res.status(200).json(gifts);
    }catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
export const deleteGift = async (req: Request, res: Response) => { 
    const { giftId } = req.body;
    try {
        const gift = await Gift.findByIdAndDelete(giftId);
        if(!gift){
            return res.status(404).json({ message: "Gift not found" });
        }
        return res.status(200).json({ message: "Gift deleted successfully" });
    }catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
export const newArrivals = async (req: Request, res: Response) => { 
    try {
        const gifts = await Gift.find().sort({ createdAt: -1 }).limit(10);
        return res.status(200).json(gifts);
    }catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }

}


