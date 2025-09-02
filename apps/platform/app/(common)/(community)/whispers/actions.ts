"use server"

import { headers } from "next/headers";
import { auth } from "~/auth";
import dbConnect from "~/lib/dbConnect";
import { WhisperModel } from "./model";

export async function createWhisper(
    confession: string,
    isAnonymous: boolean,
) {
    "use server";
    try{
        const headersList = await headers();
        const session = await auth.api.getSession({
            headers: headersList,
        });
        if (!session) {
            throw new Error("UNAUTHORIZED",{
                cause: {
                    status: 401,
                    message: "You must be logged in to create a whisper.",
                },
            });
        }
        const userId = session.user.id;
        await dbConnect();
        const newWhisper = new WhisperModel({
            userId,
            isAnonymous,
            content: confession,
            labels: {
                hateSpeech: false,
                nsfw: false,
                toxic: false,
                normal: true,
            },
            status: "pending",
            likes: 0,
        })
        await newWhisper.save();
        return Promise.resolve({
            status: 200,
            message: "Whisper created successfully.",
            whisper: JSON.parse(JSON.stringify(newWhisper)), // Convert to plain object
        })
    } catch (error) {
        console.error("Error creating whisper:", error);
        return Promise.reject({
            status: 500,
            message: "Failed to create whisper.",
            error: JSON.parse(JSON.stringify(error)),
        });
    }

}