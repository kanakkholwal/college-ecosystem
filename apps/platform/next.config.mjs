/** @type {import('next').NextConfig} */

// import withSerWistInit from '@serwist/next';

// const withSerWist = withSerWistInit({
//   cacheOnNavigation: true,
//   swSrc: "app/sw.ts",
//   swDest: "public/sw.js",
// disable: process.env.NODE_ENV !== "production",

// });

const nextConfig = {
  reactStrictMode: true,
  crossOrigin: 'anonymous',
  skipTrailingSlashRedirect: true,

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

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
  },
  poweredByHeader: false,
  // Webpack optimizations
  // webpack: (config, { dev, isServer }) => {
  //   if (!dev && !isServer) {
  //     config.optimization.splitChunks = {
  //       chunks: 'all',
  //       cacheGroups: {
  //         vendor: {
  //           test: /[\\/]node_modules[\\/]/,
  //           name: 'vendors',
  //           chunks: 'all',
  //         },
  //         common: {
  //           name: 'common',
  //           minChunks: 2,
  //           chunks: 'all',
  //           enforce: true,
  //         },
  //       },
  //     };
  //   }
  //   return config;
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
};

// export default withSerWist(nextConfig);
export default nextConfig;


