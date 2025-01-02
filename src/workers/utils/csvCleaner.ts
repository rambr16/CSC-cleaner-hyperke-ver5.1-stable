// List of columns that should always be included in the output
const PRESERVED_COLUMNS = [
  'email',
  'fullName',
  'firstName',
  'lastName',
  'title',
  'phone',
  'mxProvider',
  'other_dm_name',
  'website',
  'company',
  'department',
  'original_website',
  'cleaned_website',
  'cleaned_company_name'
] as const;

// List of patterns for columns that should be excluded
const EXCLUDED_PATTERNS = [
  /^email_\d+/i,
  /^email\d+/i,
  /_first_name$/i,
  /_last_name$/i,
  /_full_name$/i,
  /_title$/i,
  /_phone$/i
];

function shouldPreserveColumn(columnName: string): boolean {
  // Check if the column should be excluded
  if (EXCLUDED_PATTERNS.some(pattern => pattern.test(columnName))) {
    return false;
  }
  
  // Keep numbered columns that aren't email-related
  if (/^\d+$/.test(columnName)) {
    return false;
  }
  
  return true;
}

export function cleanCSVData(data: any[]): any[] {
  return data.map(row => {
    const cleanRow: any = {};
    
    // Always include preserved columns, even if undefined
    PRESERVED_COLUMNS.forEach(col => {
      cleanRow[col] = row[col];
    });

    // Add any other columns that should be preserved
    Object.entries(row).forEach(([key, value]) => {
      if (
        !PRESERVED_COLUMNS.includes(key as any) &&
        shouldPreserveColumn(key) &&
        value != null &&
        value !== ''
      ) {
        cleanRow[key] = value;
      }
    });

    return cleanRow;
  });
}