/** @type {import('next').NextConfig} */
/* global process */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoBasePath = "/smart-bkpa"; // cspell:ignore bkpa

const nextConfig = {
  assetPrefix: isGithubPages ? repoBasePath : "",
  basePath: isGithubPages ? repoBasePath : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? repoBasePath : "",
  },
  images: {
    unoptimized: true,
  },
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
};

export default nextConfig;
