import { Request, Response } from "express";
import * as fs from "node:fs";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
import cloudinary from '../config/cloudinary';

dotenv.config();

export const generateGiftImage = async (req: Request, res: Response) => {
  try {
    const { imageUrls, prompt } = req.body as {
      imageUrls: string[];
      prompt: string;
    };

    const apiKey = process.env.STABILITY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "Stability AI API key not configured",
      });
    }

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({
        message: "imageUrls must be a non-empty array",
      });
    }

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        message: "prompt is required",
      });
    }

    const imageBuffer = await downloadImageAsBuffer(imageUrls[0]);

    const form = new FormData();
    form.append("image", imageBuffer, {
      filename: "input-image.png",
      contentType: "image/png",
    });
    form.append("prompt", prompt);
    form.append("select_prompt", "flowers");
    form.append("output_format", "webp");

    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/edit/search-and-recolor",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${apiKey}`,
          Accept: "image/*",
        },
        responseType: "arraybuffer",
        validateStatus: () => true,
      }
    );

    const contentType = response.headers["content-type"];

    console.log("Status:", response.status);
    console.log("Content-Type:", contentType);

    if (response.status === 200) {
           const generatedImageBuffer = Buffer.from(response.data);

    const imageUrl = await uploadBufferToCloudinary(generatedImageBuffer);

    return res.status(200).json({
      message: "Image generated and uploaded successfully",
      imageUrl,
    });
    }

    if (contentType && contentType.includes("application/json")) {
      const errorText = Buffer.from(response.data).toString("utf8");
      return res.status(response.status).json({
        message: "Stability API returned an error",
        error: JSON.parse(errorText),
      });
    }

    return res.status(response.status).json({
      message: "Stability API returned a non-JSON error response",
      contentType,
    });
  } catch (error: any) {
    console.error("generateGiftImage error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

async function downloadImageAsBuffer(imageUrl: string): Promise<Buffer> {
  const response = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });

  return Buffer.from(response.data);
}

export function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string = "gift-images"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        format: "webp",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}