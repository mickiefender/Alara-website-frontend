/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 👈 ADD THIS

  experimental: {
    turbo: {
      loaders: {
        '.js': ['builtin:swc-loader'],
      }
    }
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },
}

export default nextConfig
