"use client";

import { useCookieWithUtils } from "@/hooks/use-cookie";


export function HostelCookieSetter({ hostelSlug }: { hostelSlug: string }) {
    const { value, setCookie, removeCookie } = useCookieWithUtils('hostel:slug');
    if (value !== hostelSlug) {
        setCookie(hostelSlug);
    }
    return null;
}