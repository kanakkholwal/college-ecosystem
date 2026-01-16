import mongoose, { type Document, Schema } from "mongoose";


export type headerMap = {
    url: string;
    scheme: string;
    Referer: string;
    CSRFToken: string;
    RequestVerificationToken: string;
    available: boolean;
};

export interface IHeaderSchema extends Document, headerMap {
}

const HeaderSchema = new Schema<IHeaderSchema>({
    scheme: { type: String, required: true,unique: true },
    url: { type: String, required: true },
    Referer: { type: String, required: true },
    CSRFToken: { type: String, required: true },
    RequestVerificationToken: { type: String, required: true },
    available: { type: Boolean, default: true },
});


export const HeaderSchemaModel =
    mongoose.models.HeaderSchema ||
    mongoose.model<IHeaderSchema>(
        "HeaderSchema",
        HeaderSchema
    );
