/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
    async rewrites() {
     return [
       {
         source: '/rpc',
         destination: 'https://api.roninchain.com/rpc',
       }
    ]
  },
}

module.exports = nextConfig
