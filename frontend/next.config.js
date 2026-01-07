/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack is often faster and might solve path inference issues
  experimental: {
    // turbopack: true
  }
};

module.exports = nextConfig;
