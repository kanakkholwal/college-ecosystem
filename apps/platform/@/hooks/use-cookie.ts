import { useEffect, useState } from 'react';

/**
 * Custom hook to get a cookie value by name
 * @param name - The name of the cookie to retrieve
 * @returns The cookie value or null if not found
 */
export function useCookie(name: string): string | null {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const getCookie = (cookieName: string): string | null => {
      if (typeof document === 'undefined') return null;
      
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${cookieName}=`);
      
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      
      return null;
    };

    setValue(getCookie(name));
  }, [name]);

  return value;
}

/**
 * Custom hook with additional cookie utilities
 * @param name - The name of the cookie
 * @returns Object with value, setCookie, and removeCookie functions
 */
export function useCookieWithUtils(name: string) {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const getCookie = (cookieName: string): string | null => {
      if (typeof document === 'undefined') return null;
      
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${cookieName}=`);
      
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      
      return null;
    };

    setValue(getCookie(name));
  }, [name]);

  const setCookie = (
    newValue: string,
    options?: {
      maxAge?: number;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
    }
  ) => {
    if (typeof document === 'undefined') return;

    let cookie = `${name}=${newValue}`;

    if (options?.maxAge) {
      cookie += `; max-age=${options.maxAge}`;
    }
    if (options?.path) {
      cookie += `; path=${options.path}`;
    }
    if (options?.domain) {
      cookie += `; domain=${options.domain}`;
    }
    if (options?.secure) {
      cookie += '; secure';
    }
    if (options?.sameSite) {
      cookie += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookie;
    setValue(newValue);
  };

  const removeCookie = (options?: { path?: string; domain?: string }) => {
    if (typeof document === 'undefined') return;

    let cookie = `${name}=; max-age=0`;

    if (options?.path) {
      cookie += `; path=${options.path}`;
    }
    if (options?.domain) {
      cookie += `; domain=${options.domain}`;
    }

    document.cookie = cookie;
    setValue(null);
  };

  return { value, setCookie, removeCookie };
}