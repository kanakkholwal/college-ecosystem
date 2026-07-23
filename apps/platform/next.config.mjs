/** @type {import('next').NextConfig} */

// import withSerWistInit from '@serwist/next';

// const withSerWist = withSerWistInit({
//   cacheOnNavigation: true,
//   swSrc: "app/sw.ts",
//   swDest: "public/sw.js",
// disable: process.env.NODE_ENV !== "production",

// });

const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true";

const nextConfig = {
  reactStrictMode: true,
  crossOrigin: 'anonymous',
  skipTrailingSlashRedirect: true,

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },



  logging: process.env.NODE_ENV !== "production"
    ? false
    : {
      fetches: {
        fullUrl: false,
      },
    },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: '**' },
      { hostname: 'visitor-badge.laobi.icu' },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    // Disable image optimization since Azure SWA does not support it natively
    unoptimized: true,
  },
  // Static export cannot include runtime API routes; enable only when explicitly requested.
  output: isStaticExport ? 'export' : 'standalone',
  // Trailing slashes help with Azure SWA routing
  trailingSlash: true,
  poweredByHeader: false,
  // Reduce bundle size

  // optimizePackageImports: [
  //   '@radix-ui/react-icons',
  //   'lucide-react',
  //   'react-icons',
  //   'framer-motion'
  // ],
  // turbo: {
  //   rules: {
  //     '*.svg': {
  //       loaders: ['@svgr/webpack'],
  //       as: '*.js',
  //     },
  //   },
  // },
};

// export default withSerWist(nextConfig);
export default nextConfig;


