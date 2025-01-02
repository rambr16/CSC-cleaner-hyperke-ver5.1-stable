export function cleanCompanyName(name: string): string {
  if (!name?.trim()) return '';

  let cleaned = name.trim().toLowerCase();

  // Remove text after separators (comma, period, dot, pipe)
  cleaned = cleaned.split(/[,.|]/).map(part => part.trim())[0];

  // Remove text within brackets and the brackets themselves
  cleaned = cleaned.replace(/\([^)]*\)/g, '');
  cleaned = cleaned.replace(/\[[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\{[^}]*\}/g, '');

  // Remove legal designations
  const legalDesignations = [
    ' ltd', ' llc', ' l.l.c', ' gmbh', ' pvt', ' private', ' limited',
    ' inc', ' corporation', ' corp', ' co', ' company', ' group',
    ' holdings', ' holding', ' solutions', ' services', ' technologies',
    ' technology', ' tech', ' international', ' intl'
  ];

  legalDesignations.forEach(designation => {
    const regex = new RegExp(`${designation}[.]?\\s*$`, 'i');
    cleaned = cleaned.replace(regex, '');
  });

  // Remove registered and trademark symbols and other special characters
  cleaned = cleaned
    .replace(/[®™©]/g, '')                    // Remove registered and trademark symbols
    .replace(/[^\w\s-]/g, ' ')               // Replace special characters with space
    .replace(/\s+/g, ' ')                    // Replace multiple spaces with single space
    .replace(/\s*-\s*/g, '-')                // Normalize spaces around hyphens
    .trim();

  // Convert to title case
  cleaned = cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Fix possessives
  cleaned = cleaned.replace(/'S\b/g, "'s");

  return cleaned;
}