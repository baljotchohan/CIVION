/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: false,
    images: {
        unoptimized: true,
    },
    // Ensure basePath is empty for root serving
    basePath: '',
};

module.exports = nextConfig;
