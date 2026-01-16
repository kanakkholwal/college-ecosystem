import z from "zod";


export const emailPayloadSchema = z.record(
  z.union([z.string(), z.number(), z.array(z.string()), z.array(z.number())])
);

export type EmailPayload = z.infer<typeof emailPayloadSchema>;

export const requestPayloadSchema = z.object({
    targets: z.array(z.string().email()),
    subject: z.string(),
    template_key: z.string(),
    payload: emailPayloadSchema,
    text: z.string().optional(),
})
export type RequestPayload = z.infer<typeof requestPayloadSchema>;

export const mailerPayloadSchema = z.object({
    to: z.array(z.string().email()),
    subject: z.string(),
    html: z.string(),
    text: z.string().optional(),
})

export type MailerPayload = z.infer<typeof mailerPayloadSchema>


