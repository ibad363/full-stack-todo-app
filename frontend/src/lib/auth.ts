// frontend/src/lib/auth.ts
// Better Auth configuration with secure httpOnly cookie handling

import { createAuthClient } from "better-auth/react";

export const auth = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  fetch: (url: string, options: any) => {
    // Ensure httpOnly cookies are used properly
    return fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}${url}`, {
      ...options,
      credentials: 'include', // Include cookies in cross-origin requests
    });
  },
});

// Configuration for secure cookie handling
export const authConfig = {
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  }
};
