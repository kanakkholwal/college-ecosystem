
import type { EmailPayload } from "@/types/schema";
import { emailPayloadSchema } from "@/types/schema";
import { emailTemplates } from "./templates";
import EmailWrapper from "./wrapper";

// map emailTemplates to their keys a Map for easier access
// and to avoid using a plain object which would require type assertions

const email_templates = new Map<string, React.FC<{ payload: EmailPayload }>>(
  Object.entries(emailTemplates).map(([key, component]) => [key, component])
);
/**
 * The function `getEmailTemplate` retrieves and renders an email template component based on a
 * specified key and payload.
 * @param  - The code you provided is a function that retrieves an email template component based on a
 * given template key and renders it within an EmailWrapper component along with a payload. Here's a
 * breakdown of the parameters and functionality:
 * @returns The `getEmailTemplate` function returns a React element that wraps the specified email
 * template component with an `EmailWrapper` component, passing the provided payload to the email
 * template component. If the template key is found in the `email_templates` map, the function returns
 * the wrapped email template component. Otherwise, it returns `null`.
 */
export function getEmailTemplate({
  template_key,
  payload,
}: {
  template_key: string;
  payload: EmailPayload;
}): React.ReactElement | null {
  const EmailComponent = email_templates.get(template_key);
  // Check if the template key exists in the email_templates map

  if (!EmailComponent) {
    console.error(`Template key "${template_key}" does not exist.`);
    return null;
  }

  const res = emailPayloadSchema.safeParse(payload);
  if (!res.success) {
    console.error(res.error.message);
    return null;
  }
  // Validate the payload
  const validatedPayload = res.data;

  return (
    <EmailWrapper>
      <EmailComponent payload={validatedPayload} />
    </EmailWrapper>
  );

}