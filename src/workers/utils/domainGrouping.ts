import { Contact } from './types';
import { cleanDomain } from './domainCleaner';
import { getValidFullName, isGenericEmail } from './nameUtils';

function createDomainGroups(data: any[]): Map<string, Contact[]> {
  const domainGroups = new Map<string, Contact[]>();
  
  data.forEach((row, index) => {
    if (!row.email?.includes('@')) return;
    
    const fullName = getValidFullName(row);
    if (!fullName || fullName.length < 3) return;
    
    const domain = row.email.split('@')[1].toLowerCase();
    if (!domain || isGenericEmail(row.email)) return;
    
    const domains = new Set([domain]);
    if (row.website) {
      const websiteDomain = cleanDomain(row.website);
      if (websiteDomain) domains.add(websiteDomain);
    }
    
    domains.forEach(d => {
      if (!domainGroups.has(d)) {
        domainGroups.set(d, []);
      }
      
      const group = domainGroups.get(d)!;
      if (!group.some(contact => contact.email.toLowerCase() === row.email.toLowerCase())) {
        group.push({ email: row.email, fullName, originalIndex: index, domain: d });
      }
    });
  });
  
  return domainGroups;
}

export function assignAlternateContacts(data: any[]): void {
  data.forEach(row => row.other_dm_name = undefined);
  
  const domainGroups = createDomainGroups(data);
  
  domainGroups.forEach(contacts => {
    if (contacts.length < 2) return;
    
    contacts.sort((a, b) => a.email.localeCompare(b.email));
    
    contacts.forEach((contact, index) => {
      const nextContact = contacts[(index + 1) % contacts.length];
      const originalRow = data[contact.originalIndex];
      
      if (originalRow && nextContact.fullName !== contact.fullName) {
        originalRow.other_dm_name = nextContact.fullName;
      }
    });
  });
}