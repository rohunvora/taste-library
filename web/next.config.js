/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.are.na' },
      { protocol: 'https', hostname: 'd2w9rnfcy7mm78.cloudfront.net' },
    ],
  },
}

module.exports = nextConfig

