import mongoose, { Document, Schema } from "mongoose";
import { IMediaUrl } from "./gift.modal";
export interface ILibrary extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    mediaUrl: IMediaUrl[];
}
const LibrarySchema: Schema = new Schema({
    title: { type: String, required: true },
    mediaUrl: { type: [{
      url: { type: String, required: true },
      public_id: { type: String, required: true }  // for cloudinary.uploader.destroy()
    }],
        required: true
    },
});
const LibraryModel = mongoose.model<ILibrary>("Library", LibrarySchema);
export default LibraryModel;