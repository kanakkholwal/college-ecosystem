/** @type {import('next').NextConfig} */

// import withSerWistInit from '@serwist/next';

// const withSerWist = withSerWistInit({
//   cacheOnNavigation: true,
//   swSrc: "app/sw.ts",
//   swDest: "public/sw.js",
//   disable: process.env.NODE_ENV !== "production",

// });

const nextConfig = {
  reactStrictMode: true,
  crossOrigin: 'anonymous',
  logging: process.env.NODE_ENV !== "production"
    ? false
    : {
      fetches: {
        fullUrl: false,
      },
    },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { hostname: 'visitor-badge.laobi.icu' },
    ],
  },
  turbopack: {
    // TODO: enable when fixed
  },

  // experimental: {
  //   forceSwcTransforms: true,
  // },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/ingest/static/:path*",
  //       destination: "https://us-assets.i.posthog.com/static/:path*",
  //     },
  //     {
  //       source: "/ingest/:path*",
  //       destination: "https://us.i.posthog.com/:path*",
  //     },
  //     {
  //       source: "/ingest/decide",
  //       destination: "https://us.i.posthog.com/decide",
  //     },
  //   ];
  // },
  skipTrailingSlashRedirect: true,
};

// export default withSerWist(nextConfig);
export default nextConfig;


