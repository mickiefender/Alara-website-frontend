/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 👈 ADD THIS

  turbo: {
    root: process.cwd(),
    loaders: {
      '.js': ['builtin:swc-loader'],
    }
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "supabase.co",
      },
    ],
  },
}

export default nextConfig
