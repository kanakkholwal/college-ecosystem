import { render } from "@react-email/components";
import { type NextRequest, NextResponse } from "next/server";

import { getEmailTemplate } from "@/emails";
import { handleEmailFire } from "@/emails/helper";
import { appConfig } from "@/project.config";
import { requestPayloadSchema } from "@/types/schema";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Authorization,X-Identity-Key, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
  "Access-Control-Max-Age": "86400",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("request body", body);
    const res = requestPayloadSchema.safeParse(body);
    console.log("Parsed request body", res);
    if (!res.success) {
      return NextResponse.json(
        {
          error: res.error,
          data: null,
        },
        { status: 400, headers: corsHeaders  }
      );
    }
    const { template_key, targets, subject, payload,text } = res.data;
    console.log("Sending email to", targets);
    console.log("Subject", subject);
    console.log("Template", template_key);
    console.log("Payload", payload);
    const EmailTemplate = getEmailTemplate({ template_key, payload });
    if(!EmailTemplate){
      return NextResponse.json(
        { error: `Template key "${template_key}" does not exist.`, data: null },
        { status: 400, headers: corsHeaders }
      );
    }

    const emailHtml = await render(EmailTemplate);
    const response = await handleEmailFire(
      appConfig.sender, // Use the sender email from appConfig
      {
        to: targets,
        subject: subject,
        html: emailHtml,
        text: text
      }
    );
    console.log("Email sent", response);

    return NextResponse.json(
      { data: response, error: null },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error in sending email:", error);
    // Handle specific error cases if needed
    return NextResponse.json({ error, data: null }, { status: 500, headers: corsHeaders });
  }
}




export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
