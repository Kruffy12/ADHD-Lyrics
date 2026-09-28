/** GitHub Pages project site base path, e.g. `/ADHD-Lyrics`. Empty for local dev or user/org root site. */
export const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";

export function withBasePath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalized}`;
}
