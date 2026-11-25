import tajGalleryRaw from '@/config/taj-gallery.json';
import type { GalleryCategory, GalleryImage } from '@/types';

interface TajRawEntry {
  id: number;
  file: string;
  url: string;
  w: number;
  h: number;
  landscape: boolean;
}

const TAJ_ENTRIES = tajGalleryRaw as TajRawEntry[];

export const TAJ_GALLERY_CATEGORIES: GalleryCategory[] = [
  { id: 1, name: 'Completed & Elevations', slug: 'completed-elevations', description: 'Completed homes and architectural elevations', display_order: 1, is_active: 1 },
  { id: 2, name: 'Active Site Execution', slug: 'site-execution', description: 'On-site construction progress and civil works', display_order: 2, is_active: 1 },
  { id: 3, name: 'Structural & RCC Works', slug: 'structural-rcc', description: 'Steel frames, brickwork, and structural engineering', display_order: 3, is_active: 1 },
  { id: 4, name: 'Architectural Highlights', slug: 'architectural-highlights', description: 'Wide architectural views and finished detailing', display_order: 4, is_active: 1 },
];

const FEATURED_HIGHLIGHT_FILES = new Set([
  'WhatsApp Image 2026-11-25 at 17.36.19 (1).jpeg',
  'WhatsApp Image 2026-11-25 at 17.36.20 (1).jpeg',
  'WhatsApp Image 2026-11-25 at 17.21.31.jpeg',
  'WhatsApp Image 2026-11-25 at 17.33.19.jpeg',
  'WhatsApp Image 2026-11-25 at 17.33.22.jpeg',
  'WhatsApp Image 2026-11-25 at 17.33.41.jpeg',
  'WhatsApp Image 2026-11-25 at 17.33.42.jpeg',
  'WhatsApp Image 2026-11-25 at 17.36.34 (1).jpeg',
  'WhatsApp Image 2026-11-25 at 17.21.59.jpeg',
  'WhatsApp Image 2026-11-25 at 17.33.14.jpeg',
]);

function classifyTajEntry(entry: TajRawEntry, index: number): {
  category_id: number;
  category_name: string;
  category_slug: string;
  title: string;
  caption: string;
} {
  if (FEATURED_HIGHLIGHT_FILES.has(entry.file) || entry.landscape) {
    return {
      category_id: 4,
      category_name: 'Architectural Highlights',
      category_slug: 'architectural-highlights',
      title: `Architectural Showcase #${String(index + 1).padStart(2, '0')}`,
      caption: 'Taj Construction — Haldwani & Uttarakhand architectural and structural execution',
    };
  }
  const bucket = index % 3;
  if (bucket === 0) {
    return {
      category_id: 1,
      category_name: 'Completed & Elevations',
      category_slug: 'completed-elevations',
      title: `Residential Elevation & Finish #${String(index + 1).padStart(2, '0')}`,
      caption: 'Residential exterior detailing and completed construction work by Taj Construction',
    };
  }
  if (bucket === 1) {
    return {
      category_id: 2,
      category_name: 'Active Site Execution',
      category_slug: 'site-execution',
      title: `Site Construction Progress #${String(index + 1).padStart(2, '0')}`,
      caption: 'On-site masonry, plastering, and supervised execution in Haldwani, Uttarakhand',
    };
  }
  return {
    category_id: 3,
    category_name: 'Structural & RCC Works',
    category_slug: 'structural-rcc',
    title: `Structural & Civil Work #${String(index + 1).padStart(2, '0')}`,
    caption: 'Reinforced concrete framing, brickwork, and civil engineering execution',
  };
}

export function getAllUniqueTajGalleryImages(): GalleryImage[] {
  const seen = new Set<string>();
  const ordered = [
    ...TAJ_ENTRIES.filter((e) => FEATURED_HIGHLIGHT_FILES.has(e.file)),
    ...TAJ_ENTRIES.filter((e) => !FEATURED_HIGHLIGHT_FILES.has(e.file) && e.landscape),
    ...TAJ_ENTRIES.filter((e) => !FEATURED_HIGHLIGHT_FILES.has(e.file) && !e.landscape),
  ];

  const items: GalleryImage[] = [];
  for (const entry of ordered) {
    if (seen.has(entry.url)) continue;
    seen.add(entry.url);
    const meta = classifyTajEntry(entry, items.length);
    items.push({
      id: entry.id,
      category_id: meta.category_id,
      category_name: meta.category_name,
      category_slug: meta.category_slug,
      project_id: null,
      project_title: null,
      title: meta.title,
      caption: meta.caption,
      alt_text: `${meta.title} — Taj Construction Haldwani Uttarakhand`,
      media_type: 'image',
      media_url: entry.url,
      thumbnail_url: entry.url,
      is_concept: 0,
      is_featured: FEATURED_HIGHLIGHT_FILES.has(entry.file) ? 1 : 0,
      status: 'published',
      display_order: items.length + 1,
    });
  }
  return items;
}
