import mongoose, { Document ,Schema} from 'mongoose';

export enum Category { 
    Boquets = "BOQUETS",
    Pot = "POT",
    Flowers = "FLOWERS",
    Keytag = "KEYTAG",
    GiftBox = "GIFTBOX"
}

export enum Size { 
    Small = "SMALL",
    Medium = "MEDIUM",
    Large = "LARGE"
}

export interface IMediaUrl {
  url: string;
  public_id: string;  // Cloudinary public_id for deletion
}

export interface IGift extends Document { 
    _id:mongoose.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    colour: string;
    size: Size;
    category: Category[];
    mediaUrl: IMediaUrl[];
    createdAt: Date;
    updatedAt: Date;
}


const giftSchema = new Schema<IGift>({
    name: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    colour: { type: String, required: true },
    size: { type: String, enum: Object.values(Size), required: false },
    category: { type: [String], enum: Object.values(Category), required: true },
    mediaUrl: { type: [{
      url: { type: String, required: true },
      public_id: { type: String, required: true }  // for cloudinary.uploader.destroy()
    }],
        required: true
    },
}, { timestamps: true });

const Gift = mongoose.model<IGift>("Gift", giftSchema);

export default Gift;