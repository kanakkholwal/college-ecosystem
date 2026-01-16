import { ResetPasswordEmail } from "./template_reset-password";
import { ResultUpdateEmail } from "./template_result-update";
import { WelcomeVerifyEmail } from "./template_welcome-verify";


export const emailTemplates = {
    "welcome_verify": WelcomeVerifyEmail,
    "reset-password": ResetPasswordEmail,
    "result_update": ResultUpdateEmail,
} as const;