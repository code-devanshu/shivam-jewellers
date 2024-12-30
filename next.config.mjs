/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"], // Add LinkedIn's domains
  },
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "djnzbmnnd",
  },
};

export default nextConfig;
