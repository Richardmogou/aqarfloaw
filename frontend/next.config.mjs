const backendUrl = (process.env.BACKEND_URL ?? "http://127.0.0.1:8000").replace("://localhost:", "://127.0.0.1:");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The browser only talks to the frontend origin, so the session cookie stays first-party.
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${backendUrl}/api/v1/:path*` }];
  },
};
export default nextConfig;
