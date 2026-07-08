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

  compiler: {
    styledComponents: true,
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

  async redirects() {
    return [
      {
        source: "/career",
        destination: "/careers",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
