/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google profile images
  },
}

module.exports = nextConfig
