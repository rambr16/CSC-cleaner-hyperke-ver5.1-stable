export function getValidFullName(row: any): string | null {
  if (row.fullName?.trim()) {
    return row.fullName.trim();
  }
  
  if (row.firstName?.trim() && row.lastName?.trim()) {
    return `${row.firstName.trim()} ${row.lastName.trim()}`;
  }
  
  return null;
}

export function isGenericEmail(email: string): boolean {
  const genericPrefixes = [
    'info', 'contact', 'sales', 'support', 'admin', 'hello', 'office',
    'marketing', 'help', 'service', 'enquiry', 'enquiries', 'general'
  ];
  const prefix = email.split('@')[0].toLowerCase();
  return genericPrefixes.some(p => prefix.includes(p));
}