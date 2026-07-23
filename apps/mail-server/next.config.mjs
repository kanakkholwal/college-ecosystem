import path from "node:path";

/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  crossOrigin: "anonymous",
  output: "standalone",
  // Pin the trace root to the monorepo root so the standalone layout is stable
  // regardless of where the build runs.
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  async headers() {
    return [
      {
        // Apply these headers to all routes in the app
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Allow all origins
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS", // Allow specific methods
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization,X-Authorization", // Allow specific headers
          },
        ],
      },
    ];
  }
};

export default nextConfig;
