/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable experimental features that cause recompile loops
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
    ],
    // REMOVED turbo feature - was causing infinite recompiles
  },
  webpack: (config, { dev, isServer }) => {
    // Add loader for GLSL shader files with glslify
    config.module.rules.push({
      test: /\.(glsl|vs|fs)$/,
      use: ['raw-loader', 'glslify-loader'],
    });

    if (dev && !isServer) {
      // Optimize development build - prevent file watcher from triggering constant recompiles
      config.watchOptions = {
        poll: false,  // ← Disable polling, use native watcher
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next', '**/.turbo', '**/dist'],
      };
      
      // Reduce bundle size in development
      config.optimization = {
        ...config.optimization,
        minimize: false,  // ← Don't minimize in dev
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              chunks: 'all',
              test: /node_modules/,
              name: 'vendor',
            },
          },
        },
      };
    }
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,  // ← Increased from 25s
    pagesBufferLength: 5,
  },
  // Improve compilation performance
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Better caching
  cacheHandler: process.env.NODE_ENV === 'production' ? require.resolve('./cache-handler.js') : undefined,
};

module.exports = nextConfig;
