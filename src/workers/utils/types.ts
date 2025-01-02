export interface EmailGroup {
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  title: string;
  phone: string;
}

export interface NormalizedColumns {
  emailGroups: Map<string, EmailGroup>;
  companyName: string;
}

export interface Contact {
  email: string;
  fullName: string;
  originalIndex: number;
  domain: string;
}