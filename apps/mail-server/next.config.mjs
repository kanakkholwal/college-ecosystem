/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  crossOrigin: "anonymous",
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
