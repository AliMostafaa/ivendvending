/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        unoptimized: true, // For local images
    },
    eslint: {
        dirs: ['src'],
    },
    typescript: {
        ignoreBuildErrors: false,
    },
};

export default nextConfig;
