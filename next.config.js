/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false, // Required for Termux / Android (no SWC binary)
};

module.exports = nextConfig;
