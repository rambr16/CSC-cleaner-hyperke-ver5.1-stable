export function cleanDomain(url: string): string | null {
  if (!url?.trim()) return null;
  
  try {
    // Remove protocol and www
    let domain = url.toLowerCase()
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0] // Remove path
      .split('?')[0] // Remove query parameters
      .split('#')[0]; // Remove hash
    
    // Basic domain validation
    if (domain.includes('.') && domain.length > 3) {
      return domain;
    }
    return null;
  } catch {
    return null;
  }
}

export function findWebsiteColumn(headers: string[]): string | null {
  const websiteColumnPatterns = ['website', 'site', 'sites', 'domain', 'url', 'web'];
  return headers.find(header => 
    websiteColumnPatterns.some(pattern => 
      header.toLowerCase().includes(pattern)
    )
  ) || null;
}