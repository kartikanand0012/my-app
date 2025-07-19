/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ✅ Skip ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ Skip TypeScript type checking during builds
    ignoreBuildErrors: true,
  },
  // Configure for Netlify deployment
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Enable static export for Netlify
  output: 'export',
  distDir: 'out',
}

module.exports = nextConfig
