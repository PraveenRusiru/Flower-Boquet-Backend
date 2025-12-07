import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import * as fs from "node:fs";  // ✅ Added missing fs import
import cloudinary from "../config/cloudinary";  // ✅ Add your cloudinary config path
import dotenv from "dotenv";
dotenv.config();

interface GenerateImageResponse {
  message: string;
  generatedImage: string;
  public_id: string | null;
}

export const generateGiftImage = async (req: Request, res: Response) => {
  
  const { imageUrls, prompt } = req.body as { imageUrls: string[]; prompt: string };
  const apiKey = process.env.GEMINI_API_KEY;

  // Validation
  if (!apiKey) {
    return res.status(500).json({ message: "Google AI API key not configured" });
  }
  
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return res.status(400).json({ message: "imageUrls must be non-empty array" });
  }
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ message: "prompt is required" });
  }

  try {
    const generatedImagePath = await generateImageFromCloudinaryUrls(
      imageUrls, 
      prompt, 
      apiKey
    );

    // Upload generated image to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(
      `./${generatedImagePath}`,
      { folder: "posts/ai-generated" }
    );

    // Clean up local file
    fs.unlinkSync(generatedImagePath);

    const response: GenerateImageResponse = {
      message: "Image generated successfully",
      generatedImage: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("AI Image generation error:", error);
    res.status(500).json({ message: error.message || "Image generation failed" });
  }
};

async function generateImageFromCloudinaryUrls(
  cloudinaryUrls: string[], 
  prompt: string,
  apiKey: string
): Promise<string> {
  const genAI = new GoogleGenAI({apiKey});

  // Download images
  const base64Images: string[] = await Promise.all(
    cloudinaryUrls.map(async (url) => {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      return Buffer.from(response.data).toString("base64");
    })
  );

  // const model = genAI.getGenerativeModel({ 
  //   model: "gemini-2.0-flash-exp-image"  // ✅ Image-specific model
  // });

  const contents: any[] = [
    {
      role: "user" as const,
      parts: [
        { text: `Generate a beautiful gift image: "${prompt}"` },
        ...base64Images.slice(0, 4).map(data => ({
          inlineData: {
            mimeType: "image/jpeg",
             data,
          },
        })),
      ],
    },
  ];

  // ✅ CORRECT config - no responseModalities
  const response = await genAI.models.generateContent( {
    model: "gemini-3-pro-image-preview",
    contents,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: '5:4',
        imageSize: '2K',
      },
    }
  });

  // const response = await result.response;
  
  // Safe extraction
 const candidates = response.candidates ?? [];
for (const candidate of candidates) {
  // ✅ Safe content access
  const content = candidate.content;
  if (!content) continue;
  
  const parts = content.parts ?? [];
  for (const part of parts) {
    // ✅ Safe inlineData check
    if (part.inlineData && typeof part.inlineData.data === 'string') {
      try {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");
        const timestamp = Date.now();
        const filePath = `generated-image-${timestamp}.png`;
        fs.writeFileSync(filePath, buffer);
        console.log(`✅ Image saved: ${filePath}`);
        return filePath;
      } catch (bufferError: any) {
        console.error("Buffer decode error:", bufferError.message);
        continue; // try next part
      }
    } else if (part.text && typeof part.text === 'string') {
      // ✅ Safe text handling
      console.log("AI Text:", part.text);
    }
  }
}

  // for (const part of response.data?.candidates?.[0]?.content?.parts?.[0]?) {
  //   if (part.text) {
  //     console.log(part.text);
  //   } else if (part.inlineData) {
  //     const imageData = part.inlineData.data;
  //     const buffer = Buffer.from(imageData, "base64");
  //     fs.writeFileSync("image.png", buffer);
  //     console.log("Image saved as image.png");
  //   }
  // }

  throw new Error("No image generated");
}

