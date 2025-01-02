import { checkMXProvider } from './utils/mxProvider';
import { processEmailColumns } from './utils/emailProcessor';
import { assignAlternateContacts } from './utils/domainGrouping';
import { cleanCSVData } from './utils/csvCleaner';
import { cleanCompanyName } from './utils/companyNameCleaner';
import { cleanDomain, findWebsiteColumn } from './utils/domainCleaner';
import { normalizeColumnNames } from './utils/columnNormalizer';

async function processData(data: any[], companyColumn: string): Promise<any[]> {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid CSV data');
  }

  try {
    self.postMessage({ type: 'progress', progress: 5, stage: 'Starting processing...' });
    
    // Normalize column names
    const headers = Object.keys(data[0]);
    const normalizedColumns = normalizeColumnNames(headers);
    
    self.postMessage({ type: 'progress', progress: 10, stage: 'Analyzing CSV structure...' });
    
    // Find website column
    const websiteColumn = findWebsiteColumn(headers);
    
    // Initialize processed data
    let processedData = [...data];
    
    // Process email columns if present
    if (normalizedColumns.emailGroups.size > 0) {
      self.postMessage({ type: 'progress', progress: 20, stage: 'Processing email data...' });
      processedData = processedData.flatMap(row => processEmailColumns(row, normalizedColumns));
      
      if (processedData.length > 0) {
        // Remove duplicate emails
        self.postMessage({ type: 'progress', progress: 40, stage: 'Removing duplicate emails...' });
        const uniqueEmails = new Set();
        processedData = processedData.filter(row => {
          if (!row.email?.trim()) return true;
          const email = row.email.toLowerCase().trim();
          if (uniqueEmails.has(email)) return false;
          uniqueEmails.add(email);
          return true;
        });

        // Process MX records
        self.postMessage({ type: 'progress', progress: 50, stage: 'Processing MX records...' });
        const batchSize = 10;
        const domainCache = new Map();
        
        for (let i = 0; i < processedData.length; i += batchSize) {
          const batch = processedData.slice(i, i + batchSize);
          await Promise.all(batch.map(async row => {
            if (!row.email) return;
            const domain = row.email.split('@')[1];
            if (!domainCache.has(domain)) {
              domainCache.set(domain, await checkMXProvider(domain));
            }
            row.mxProvider = domainCache.get(domain);
          }));
          
          const progress = 50 + Math.min(((i + batch.length) / processedData.length) * 30, 30);
          self.postMessage({ 
            type: 'progress',
            progress,
            stage: `Processing MX records (${i + batch.length}/${processedData.length})...`
          });
        }

        // Assign alternate contacts
        self.postMessage({ type: 'progress', progress: 80, stage: 'Assigning alternate contacts...' });
        assignAlternateContacts(processedData);
      }
    }

    // Process website data
    if (websiteColumn) {
      self.postMessage({ type: 'progress', progress: 90, stage: 'Processing website data...' });
      processedData = processedData.map(row => ({
        ...row,
        original_website: row[websiteColumn],
        cleaned_website: cleanDomain(row[websiteColumn])
      }));
    }

    // Process company names
    const effectiveCompanyColumn = companyColumn || normalizedColumns.companyName;
    if (effectiveCompanyColumn) {
      self.postMessage({ type: 'progress', progress: 95, stage: 'Processing company names...' });
      processedData = processedData.map(row => ({
        ...row,
        cleaned_company_name: cleanCompanyName(row[effectiveCompanyColumn])
      }));
    }

    // Final cleanup
    self.postMessage({ type: 'progress', progress: 98, stage: 'Finalizing data...' });
    const cleanedData = cleanCSVData(processedData);

    self.postMessage({ type: 'progress', progress: 100, stage: 'Processing complete' });
    return cleanedData;
  } catch (error) {
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

self.onmessage = async (e) => {
  try {
    const result = await processData(e.data.data, e.data.companyColumn);
    self.postMessage({
      type: 'complete',
      data: result
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};