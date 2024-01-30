/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "anphatcore.vercel.app", "unsplash.com", "utfs.io"]
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

module.exports = nextConfig;
