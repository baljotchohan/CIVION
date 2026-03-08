/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    // Ensure basePath is empty for root serving
    basePath: '',
};

module.exports = nextConfig;
