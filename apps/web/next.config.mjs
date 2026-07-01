/** @type {import('next').NextConfig} */
const nextConfig = {
  // 让 Next 直接编译 @taskflow/shared 的 TS 源码（走 exports.import）
  transpilePackages: ['@taskflow/shared'],
  // 跨域图片域名白名单（头像、附件等）
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
