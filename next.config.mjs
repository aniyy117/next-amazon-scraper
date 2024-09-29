/** @type {import('next').NextConfig} */

//https://m.media-amazon.com/images/I/811H-gBBKrL._AC_UL320_.jpg
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
    ],
  },
};

export default nextConfig;
