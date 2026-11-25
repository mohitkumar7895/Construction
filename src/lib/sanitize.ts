import sanitizeHtml from 'sanitize-html';

export const ALLOWED_RICHTEXT_TAGS = [
  'h2',
  'h3',
  'h4',
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'hr',
  'span',
];

export function sanitizeRichHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_RICHTEXT_TAGS,
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      span: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const isExternal = attribs.target === '_blank';
        return {
          tagName,
          attribs: {
            ...attribs,
            ...(isExternal ? { rel: 'noopener noreferrer' } : {}),
          },
        };
      },
    },
  });
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim();
}
