import { EmailGroup, NormalizedColumns } from './types';
import { columnPatterns } from './columnPatterns';

function findMatchingColumn(headers: string[], patterns: string[]): string {
  const normalizedHeaders = headers.map(h => h.toLowerCase());
  return headers.find((_, index) => 
    patterns.some(pattern => normalizedHeaders[index] === pattern.toLowerCase())
  ) || '';
}

function getEmailNumber(column: string): string | null {
  const match = column.match(/(?:_)?(\d+)$/);
  return match ? match[1] : null;
}

function findRelatedColumn(headers: string[], emailColumn: string, patterns: string[]): string {
  const emailNum = getEmailNumber(emailColumn);
  if (!emailNum) {
    // For the main email column, try both direct match and email_ prefixed patterns
    const directMatch = findMatchingColumn(headers, patterns);
    if (directMatch) return directMatch;
    
    // Try email_ prefixed patterns
    return headers.find(h => 
      patterns.some(p => h.toLowerCase() === `email_${p.toLowerCase()}`)
    ) || '';
  }
  
  // For numbered email columns, try both formats
  return headers.find(h => 
    patterns.some(p => 
      h.toLowerCase() === `email_${emailNum}_${p.toLowerCase()}` ||
      h.toLowerCase() === `email${emailNum}_${p.toLowerCase()}`
    )
  ) || '';
}

function findEmailColumns(headers: string[]): string[] {
  return headers.filter(header => {
    const normalized = header.toLowerCase();
    return columnPatterns.email.some(pattern => 
      normalized === pattern || 
      normalized.match(new RegExp(`^${pattern}_\\d+$`)) ||
      normalized.match(new RegExp(`^${pattern}\\d+$`))
    );
  });
}

export function normalizeColumnNames(headers: string[]): NormalizedColumns {
  const emailColumns = findEmailColumns(headers);
  const emailGroups = new Map<string, EmailGroup>();
  
  // Find the main phone column first
  const mainPhoneColumn = findMatchingColumn(headers, columnPatterns.phone);

  emailColumns.forEach(emailCol => {
    emailGroups.set(emailCol, {
      email: emailCol,
      fullName: findRelatedColumn(headers, emailCol, columnPatterns.fullName),
      firstName: findRelatedColumn(headers, emailCol, columnPatterns.firstName),
      lastName: findRelatedColumn(headers, emailCol, columnPatterns.lastName),
      title: findRelatedColumn(headers, emailCol, columnPatterns.title),
      // Use the main phone column if no email-specific phone column is found
      phone: findRelatedColumn(headers, emailCol, columnPatterns.phone) || mainPhoneColumn
    });
  });

  return {
    emailGroups,
    companyName: findMatchingColumn(headers, columnPatterns.companyName)
  };
}