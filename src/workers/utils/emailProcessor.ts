import { NormalizedColumns } from './types';

export function processEmailColumns(row: any, normalizedColumns: NormalizedColumns): any[] {
  const results: any[] = [];
  const baseData = { ...row };
  
  // Create a set of columns to exclude from baseData
  const columnsToExclude = new Set<string>();
  
  // Add email-related columns to exclusion set
  for (const group of normalizedColumns.emailGroups.values()) {
    columnsToExclude.add(group.email);
    columnsToExclude.add(group.fullName);
    columnsToExclude.add(group.firstName);
    columnsToExclude.add(group.lastName);
    columnsToExclude.add(group.title);
    // Don't exclude the phone column as we want to preserve it
  }

  // Remove excluded columns from baseData
  columnsToExclude.forEach(col => {
    if (col) delete baseData[col];
  });

  // Process each email group
  for (const group of normalizedColumns.emailGroups.values()) {
    const email = row[group.email]?.trim();
    if (!email) continue;

    const result = {
      ...baseData,
      email,
      fullName: row[group.fullName]?.trim() || '',
      firstName: row[group.firstName]?.trim() || '',
      lastName: row[group.lastName]?.trim() || '',
      title: row[group.title]?.trim() || '',
      // Preserve the phone number, falling back to any phone-like column
      phone: row[group.phone]?.trim() || Object.entries(row).find(([key, value]) => 
        key.toLowerCase().includes('phone') && value
      )?.[1] || ''
    };

    // If we don't have a full name but have first and last name, combine them
    if (!result.fullName && result.firstName && result.lastName) {
      result.fullName = `${result.firstName} ${result.lastName}`;
    }

    results.push(result);
  }

  return results;
}