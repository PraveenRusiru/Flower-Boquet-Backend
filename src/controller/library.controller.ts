import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import LibraryModel from "../model/library.modal";
import { IMediaUrl } from "../model/gift.modal";
export const createLibrary =async (req: Request, res: Response) => {
    const { title } = req.body;

    if (!title ) {
        return res.status(400).json({ message: "Title is required." });
    }

    try { 
           let imgUrl: { url: string; public_id: string }[] = [];
        
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
        
                  imgUrl.push({ url: result.secure_url, public_id: result.public_id });
              }
            }
        
            if (imgUrl.length === 0) {
              return res.status(400).json({ message: "At least one image is required" });
            }
        
        const newLibrary = new LibraryModel({
            title,
            mediaUrl: imgUrl, // schema: [String]
        });

        await newLibrary.save();
        return res.status(201).json(newLibrary);
    }catch (error) {
        return res.status(500).json({ message: "Internal server error"+error });
    }
}
 
export const getLibraries = async (req: Request, res: Response) => {
    const { imageId } = req.body;
    try {
        const library = await LibraryModel.findById(imageId);
        if (!library) {
            return res.status(404).json({ message: "Library not found" });
        }
        return res.status(200).json(library);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" + error });
    }
}
 
export const getAllLibraries = async (req: Request, res: Response) => {
    try {
        const libraries = await LibraryModel.find();
        return res.status(200).json(libraries);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" + error });
    }
}
export const updateTitle = async (req: Request, res: Response) => { 
    const { libraryId, title } = req.body;
    try { 
        const library = await LibraryModel.findById(libraryId);
        if(!library){
            return res.status(404).json({ message: "Library not found" });
        }
        console.log("Updating title to:", title,library);
        library.title = title || library.title;

        await library.save();
        return res.status(200).json(library);
    }catch (error) {
        return res.status(500).json({ message: "Internal server error"+error });
    }
} 

export const deleteLibrary = async (req: Request, res: Response) => { 
    const { libraryId } = req.body;
    try { 
        const library = await LibraryModel.findByIdAndDelete(libraryId);
        if(!library){
            return res.status(404).json({ message: "Library not found" });
        }

        return res.status(200).json({ message: "Library deleted successfully" });
    }catch (error) {
        return res.status(500).json({ message: "Internal server error"+error });
    }
}

export const deleteImageFromLibrary = async (req: Request, res: Response) => { 
    const { libraryId } = req.body;
    try { 
        const library = await LibraryModel.findById(libraryId);
        if(!library){
            return res.status(404).json({ message: "Library not found" });
        }
        const public_id = library.mediaUrl[0].public_id;

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(public_id);

        // Remove from database
        library.mediaUrl = library.mediaUrl.filter(media => media.public_id !== public_id);
        await library.save();

        return res.status(200).json({ message: "Image deleted successfully from library" });    
        
    }catch (error) {
        return res.status(500).json({ message: "Internal server error"+error });
    }
}

export const updateImagesToLibrary = async (req: Request, res: Response) => { 
    const { libraryId } = req.body;

    if (!libraryId) {
        return res.status(400).json({ message: "Library ID is required." });
    }

    try { 
        const library = await LibraryModel.findById(libraryId);
        if(!library){
            return res.status(404).json({ message: "Library not found" });
        }

        let mediaUrls = library.mediaUrl; // existing media URLs

        const files = req.files as Express.Multer.File[] | undefined;
        const newMediaUrls: IMediaUrl[] = [];
        
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No images provided for upload." });
        }
        // UPLOAD new images to Cloudinary
        for (const file of files) {
            const result: any = await new Promise((resolve, reject) => {
                const upload_stream = cloudinary.uploader.upload_stream(
                    { folder: "posts" },
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
        // Update database with new media URLs
        mediaUrls.push(...newMediaUrls);
        library.mediaUrl = mediaUrls;

        await library.save();

        return res.status(200).json({
            message: "Images added successfully to library",
            library
        });
        
    }catch (error) {
        return res.status(500).json({ message: "Internal server error"+error });
    }
}

export const findByName = async (req: Request, res: Response) => { 
    const { title} = req.body;
    try { 

        const libraries = await LibraryModel.find({
            title: { $regex: title, $options: "i" } // case-insensitive search
        });

        const libraryCount = libraries.length;
        if(!libraries || libraryCount === 0){
            return res.status(404).json({ message: "Library not found" });
        }

        return res.status(200).json({libraryCount,libraries});
        // {
        //     // "Search results": libraries.length,
        //      libraries
        // }
    }catch (error) {
        return res.status(500).json({ message: "Internal server error"+error });
    }
}