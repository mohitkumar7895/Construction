import { revalidatePath } from 'next/cache';

export function revalidatePublicSite(extraPaths: string[] = []): void {
  const corePaths = [
    '/',
    '/about',
    '/services',
    '/projects',
    '/gallery',
    '/contact',
    '/privacy-policy',
    '/terms-and-conditions',
    '/sitemap.xml',
    '/robots.txt',
    ...extraPaths,
  ];
  for (const p of corePaths) {
    try {
      revalidatePath(p);
    } catch {
      // Safe no-op outside request lifecycle
    }
  }
  try {
    revalidatePath('/', 'layout');
  } catch {
    // Safe no-op
  }
}
