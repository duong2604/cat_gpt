import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** Địa chỉ API nội bộ mà server Next.js chuyển tiếp tới (không lộ ra trình duyệt). */
const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  /**
   * Trình duyệt chỉ gọi /api/* trên cùng origin với web → cookie httpOnly hoạt động,
   * không cần CORS. Khi triển khai, Nginx đảm nhận việc chuyển tiếp này.
   */
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_INTERNAL_URL}/api/:path*` }];
  },
};

export default withNextIntl(nextConfig);
