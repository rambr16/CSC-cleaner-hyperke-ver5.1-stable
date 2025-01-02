export function findNumberedColumns(headers: string[], basePattern: string): string[] {
  // Match both numbered (email_1) and unnumbered (email) patterns
  const patterns = [
    new RegExp(`^${basePattern}(_\\d+)?$`, 'i'),
    new RegExp(`^${basePattern}\\d+$`, 'i')  // For email1, email2 format
  ];
  
  return headers.filter(header => 
    patterns.some(pattern => pattern.test(header.toLowerCase()))
  );
}

export function getEmailGroupNumber(columnName: string): string {
  // Match both email_1 and email1 formats
  const match = columnName.match(/(?:_)?(\d+)$/);
  return match ? match[1] : '';
}

export function findRelatedColumn(headers: string[], emailColumn: string, fieldType: string): string {
  const groupNumber = getEmailGroupNumber(emailColumn);
  const patterns = [
    // email_1_full_name pattern
    new RegExp(`^email_${groupNumber}_${fieldType}$`, 'i'),
    // email1_full_name pattern
    new RegExp(`^email${groupNumber}_${fieldType}$`, 'i'),
    // For the first email group without number
    ...(groupNumber === '' ? [new RegExp(`^email_${fieldType}$`, 'i')] : [])
  ];
  
  return headers.find(header => 
    patterns.some(pattern => pattern.test(header.toLowerCase()))
  ) || '';
}