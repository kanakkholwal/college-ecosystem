import { TailwindConfig } from "@react-email/tailwind";


export const twConfig = {
    theme: {
        extend: {
            colors: {
                brand: "#7c3bed",
                border: "#eaeaea",
                muted: {
                    DEFAULT: "#f8fafc",
                    foreground: "#6b7280",
                }
            },
        },
    },
} satisfies TailwindConfig;
