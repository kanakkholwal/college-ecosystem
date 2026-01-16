import { google } from "@ai-sdk/google";
import { mistral } from '@ai-sdk/mistral';
import { generateObject, ModelMessage, NoObjectGeneratedError } from "ai";
import { PromptMaps, PromptMapsType } from "./prompts";

const docScannerModel = mistral('mistral-small-latest');

export const safetySettings = [
  { category: "HARM_CATEGORY_UNSPECIFIED", threshold: "BLOCK_LOW_AND_ABOVE" },
];

// export const model = deepseek("deepseek-chat");
export const model = google("gemini-1.5-pro-latest");

export const modelId = "gemini-1.5-pro-latest";

export async function generateJsonFromDocument(
  files: (string | ArrayBuffer)[],
  schemaName: keyof PromptMapsType["documentToJson"],
) {
  const prompt: Array<ModelMessage> = PromptMaps.documentToJson[schemaName].mapPromptToMessage(files);
  const { system, schemaName: sName, schemaDescription, schema } = PromptMaps.documentToJson[schemaName];
  try {
    const response = await generateObject({
      model: docScannerModel,
      schema,
      schemaName: sName,
      schemaDescription,
      system,
      messages: prompt,
      mode: "json",
      // optional settings:
      providerOptions: {
        mistral: {
          documentImageLimit: 0,
          // documentPageLimit: 64,
        },
        google: {
          safetySettings,
        },
      },
    });
    return Promise.resolve({
      error: null,
      object: response.object,
      message: response.object.length + " objects generated successfully",
    });
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      return Promise.resolve({
        error: JSON.parse(JSON.stringify(error)),
        object: [],
        message:
          error.text ||
          "No objects were generated from the document. Please ensure the document contains clear and structured information.",
      });
    }

    // Handle other types of errors
    console.error(
      "An error occurred while generating objects from the document:",
      error
    );
    return Promise.resolve({
      error:
        error instanceof Error
          ? error.message
          : new Error("An unexpected error occurred"),
      object: [],
      message:
        "An error occurred while generating objects from the document. Please try again later.",
    });
  }
}