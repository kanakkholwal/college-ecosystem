"use client";

import { useCookieWithUtils } from "@/hooks/use-cookie";
import { useEffect } from "react";

export function HostelCookieSetter({ hostelSlug }: { hostelSlug: string }) {
    const { value, setCookie } = useCookieWithUtils('hostel:slug');
    
    useEffect(() => {
        if (value !== hostelSlug) {
            setCookie(hostelSlug);
        }
    }, [value, hostelSlug, setCookie]);
    
    return null;
}