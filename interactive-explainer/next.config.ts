import type { NextConfig } from "next";

// this is so github pages works but also local dev environments
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  /* config options here */
  // see https://nextjs.org/docs/pages/guides/static-exports
  output: "export",

  // Change the output directory `out` -> `dist`
  distDir: "dist",

  // fixes links
  trailingSlash: true,

  // this is so links use the correct github pages url rather than the base
  basePath,

  // exposes basePath to client code so hardcoded asset src attributes
  // (next/image doesn't auto-prepend basePath when images.unoptimized is set)
  // can be prefixed manually
  env: { NEXT_PUBLIC_BASE_PATH: basePath },

  images: { unoptimized: true },
};

export default nextConfig;
