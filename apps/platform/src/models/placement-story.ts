import mongoose, { Schema, type Document, type Model } from "mongoose";
import { PlacementStoryInput } from "~/constants/placement-story";



// --- 2. Mongoose Interface & Schema ---
export interface IPlacementStory extends Document, PlacementStoryInput {
    createdAt: Date;
    updatedAt: Date;
}

const PlacementStorySchema = new Schema<IPlacementStory>(
    {
        author: {
            id: { type: String, required: true, index: true },
            name: { type: String, required: true },
            username: { type: String, required: true },
        },
        companyName: { type: String, required: true, index: true },
        role: { type: String, required: true },
        offerType: {
            type: String,
            enum: ["Internship", "FTE", "PPO", "Intern+FTE", "Other"],
            required: true
        },
        location: { type: String },
        ctc: { type: String },

        selectionProcess: { type: String, required: true }, // Store as Markdown/Text
        preparationStrategy: { type: String, required: true },

        resources: [{
            title: String,
            url: String
        }],

        isVerified: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
);

export const PlacementStoryModel =
    (mongoose.models?.PlacementStory as Model<IPlacementStory>) ||
    mongoose.model<IPlacementStory>("PlacementStory", PlacementStorySchema);