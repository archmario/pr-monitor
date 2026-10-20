import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Reads live data from the backend on every request - not a static export
  // like fe-wordwiz, since the whole point is that it stays current.
};

export default nextConfig;
