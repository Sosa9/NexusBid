export interface TurnoverYear {
  fiscalYear: string;
  amount: number; // In Crores
  updationFactor: number; // 1.0 if 'No Updation Factor'
  isNoFactor: boolean; // Tracking strictly for UI state
}

export interface Project {
  id: string;
  name: string;
  participationPercentage: number;
  startDate: string;
  constructionPeriodMonths: number;
  contractValue: number; // Crores
  completedValue: number; // Crores
  anticipatedCompletionDate: string;
}

export interface CompanyData {
  companyName: string;
  registeredAddress: string;
  turnoverData: TurnoverYear[];
  nValue: number; // Years
  projects: Project[];
  cValue: number; // Bonus in Crores
  lastUpdated: string;
}

export type AppView = 'ONBOARDING' | 'DASHBOARD' | 'CALCULATOR';
export type CalculatorStep = 'TURNOVER' | 'N_VALUE' | 'PROJECTS' | 'BONUS' | 'SUMMARY';

export const UPDATION_FACTORS = [
  { label: '1.20', value: 1.20 },
  { label: '1.15', value: 1.15 },
  { label: '1.10', value: 1.10 },
  { label: '1.05', value: 1.05 },
  { label: '1.00', value: 1.00 },
  { label: 'No Updation Factor', value: 1.00 },
];
