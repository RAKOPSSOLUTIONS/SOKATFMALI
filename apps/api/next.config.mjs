/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Prisma needs to be treated as an external package in server components.
  serverExternalPackages: ["@prisma/client", "prisma"],
  // No ESLint config shipped in this starter — don't fail production builds on it.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
