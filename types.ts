export interface Email {
  id: number;
  sender: string;
  subject: string;
  snippet: string;
}

export interface DeletionAnalysis {
  id: number;
  reason: string;
}

export interface CustomRules {
  alwaysDelete: string;
  neverDelete: string;
}