import { Client } from "@notionhq/client";
import { applicationSchema } from './validation';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function saveApplication(payload: any) {
    try {
        const response = applicationSchema.safeParse(payload);
        if (!response.success) {
            return Promise.resolve(
                { 
                    error: response.error.issues.map(err => err.message),
                    data:null,
                    message: "Validation Error"
                 }
            );
        }
        const validated = response.data;

        await notion.pages.create({
            parent: { database_id: process.env.NOTION_DATABASE_ID! },
            properties: {
                Name: { title: [{ text: { content: validated.name } }] },
                Email: { email: validated.collegeId },
                Year: { select: { name: validated.collegeYear } },
                Mobile:{
                    phone_number: validated.mobile || ""
                },
                'Work Links': {
                    rich_text: validated.workLinks.map(link => ({
                        text: { content: link.url, link: { url: link.url } }
                    }))
                },
                'Best Project': {
                    rich_text: [{ text: { content: validated.bestProject ?? "" } }]
                },
                'Best Hack': {
                    rich_text: [{ text: { content: validated.bestHack ?? "" } }]
                },
                Status: { select: { name: "Applied" } }
            }
        });

        return Promise.resolve({ success: true, data: null, message: "Application Submitted Successfully" });
    } catch (error) {
        console.error(error);
        return Promise.resolve(
            { 
                error: "Submission failed",
                data:null,
                message: "Submission failed"
             }
        );
    }
}