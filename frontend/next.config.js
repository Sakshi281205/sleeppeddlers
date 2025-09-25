/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    VITE_API_BASE: process.env.VITE_API_BASE,
    VITE_API_KEY: process.env.VITE_API_KEY,
  },
}

module.exports = nextConfig
