import { FilePart, ImagePart, ModelMessage } from "ai";
import { courseArraySchema, eventArraySchema } from "./schema";

export const PromptMaps:PromptMapsType = {
    documentToJson: {
        events: {
            system: `You are an advanced ocr AI that can extract events from a document.
            You will be provided with a document containing various events. Your task is to extract these events and return them in a structured format. Each event should include the title, description, links, time, end date, event type, and location if applicable. Ensure that the extracted events are accurate and well-formatted.`,
            schemaName: "events",
            schemaDescription: `Array of events extracted from the document, each event must follow the events schema.`,
            schema: eventArraySchema,
            mapPromptToMessage: (files: (ImagePart | FilePart | (string | ArrayBuffer))[]): ModelMessage[] => {
                return [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Extract events from the provided document.",
                            },
                            ...(files.map((file) => {
                                if (typeof file === "string" || file instanceof ArrayBuffer) {
                                    return {
                                        type: "image",
                                        image: typeof file === "string"
                                            ? new URL(file)
                                            : new URL(URL.createObjectURL(new Blob([file]))),
                                    } as ImagePart;
                                } else if ('image' in file) {
                                    return file;
                                } else {
                                    return file;
                                }
                            })),
                        ],
                    },
                ]
            }

        },
        courses:{
            system: `You are an advanced ocr AI that can extract courses from a document.
            You will be provided with a document containing various courses. Your task is to extract these courses and return them in a structured format. Each course should include the course name, course code, description, credits, instructor, schedule, and location if applicable, along with it's chapters/units . Ensure that the extracted courses are accurate and well-formatted.`,
            schemaName: "courses",
            schemaDescription: `Array of courses extracted from the document, each course must follow the course schema.`,
            schema: courseArraySchema,
            mapPromptToMessage: (files: (ImagePart | FilePart | (string | ArrayBuffer))[]): ModelMessage[] => {
                return [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Extract events from the provided document.",
                            },
                            ...(files.map((file) => {
                                if (typeof file === "string" || file instanceof ArrayBuffer) {
                                    return {
                                        type: "image",
                                        image: typeof file === "string"
                                            ? new URL(file)
                                            : new URL(URL.createObjectURL(new Blob([file]))),
                                    } as ImagePart;
                                } else if ('image' in file) {
                                    return file;
                                } else {
                                    return file;
                                }
                            })),
                        ],
                    },
                ]
            }
        }
    }
} as const;
export type documentToJsonType ={
        system: string;
        schemaName: string;
        schemaDescription: string;
        schema: typeof eventArraySchema | typeof courseArraySchema;
        mapPromptToMessage: (files: (ImagePart | FilePart | (string | ArrayBuffer))[]) => ModelMessage[];
}
export type PromptMapsType = {
    documentToJson: Record<string, documentToJsonType>;
}