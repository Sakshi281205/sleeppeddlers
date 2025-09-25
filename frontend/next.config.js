/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'https://h8r6q6qsu0.execute-api.us-east-1.amazonaws.com/prod',
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY || 'hackathon-demo-key-2025-xyz',
  },
}

module.exports = nextConfig
