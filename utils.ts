
import { CompanyData, Project, TurnoverYear } from './types';

/**
 * Formats a number as INR Currency (Crores or Absolute based on context).
 * Currently set to format large numbers for display consistency.
 */
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value * 10000000); // Display full value for tooltips, but UI mostly uses Crores
};

/**
 * Calculates the updated turnover based on a specific updation factor.
 * Rounded to 2 decimal places.
 */
export const calculateUpdatedTurnover = (amount: number, factor: number) => {
  return Number((amount * factor).toFixed(2));
};

/**
 * Calculates the 'Effective Balance' of a project based on the N value (Analysis Horizon).
 * 
 * Logic:
 * 1. If the project's Anticipated Completion Date is within 'N' years from today:
 *    Balance = Contract Value - Value of Work Completed
 * 
 * 2. If the project's Anticipated Completion Date is AFTER 'N' years from today:
 *    Balance is calculated pro-rata:
 *    (Contract Value / Construction Period Months) * (N * 12)
 * 
 * @param project The project object containing value and dates
 * @param nYears The 'N' value (Number of years prescribed for completion)
 * @returns The effective balance value in Crores
 */
export const calculateEffectiveBalance = (project: Project, nYears: number): number => {
  const {
    contractValue,
    completedValue,
    constructionPeriodMonths,
    anticipatedCompletionDate,
  } = project;

  // Fallback if critical data missing or N is not yet set
  if (!anticipatedCompletionDate || !constructionPeriodMonths || !nYears || nYears <= 0) {
    return Math.max(0, contractValue - completedValue);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today
  
  const completionDate = new Date(anticipatedCompletionDate);
  completionDate.setHours(0, 0, 0, 0); // Normalize completion date

  // Calculate cutoff date: Today + N years
  // Using milliseconds for better precision with fractional years
  const daysInYear = 365.25;
  const cutoffTime = today.getTime() + (nYears * daysInYear * 24 * 60 * 60 * 1000);
  const cutoffDate = new Date(cutoffTime);

  if (completionDate.getTime() <= cutoffDate.getTime()) {
    // Case 1: Project completes within N years
    // Logic: Contract Value - Work Completed
    return Math.max(0, contractValue - completedValue);
  } else {
    // Case 2: Project completes after N years
    // Logic: Pro-rata -> (Contract Value / Construction Period) * (N * 12)
    if (constructionPeriodMonths === 0) return 0; // Prevent division by zero
    
    const nMonths = nYears * 12;
    const monthlyRate = contractValue / constructionPeriodMonths;
    const proRataValue = monthlyRate * nMonths;
    
    return proRataValue;
  }
};

/**
 * Calculates the Adjusted Balance based on participation percentage.
 * Formula: (Participation % / 100) * Effective Balance * 1.00
 */
export const calculateAdjustedBalance = (participation: number, balance: number) => {
  // Formula: Percentage of participation * Balance value * 1.00
  return Number(((participation / 100) * balance * 1.0).toFixed(2));
};

/**
 * Calculates Value A: Maximum Updated Turnover over the last 5 years.
 */
export const calculateA = (turnoverData: TurnoverYear[]): number => {
  const updatedValues = turnoverData.map(t => calculateUpdatedTurnover(t.amount, t.updationFactor));
  return Math.max(...updatedValues, 0);
};

/**
 * Calculates Value B: Sum of all Adjusted Balances for ongoing projects.
 */
export const calculateB = (projects: Project[], nYears: number): number => {
  return projects.reduce((acc, project) => {
    const effectiveBalance = calculateEffectiveBalance(project, nYears);
    const adjusted = calculateAdjustedBalance(project.participationPercentage, effectiveBalance);
    return acc + adjusted;
  }, 0);
};

/**
 * Calculates the final Bid Capacity.
 * Formula: (A * N * 2.5) - B + C
 */
export const calculateBidCapacity = (data: CompanyData): number => {
  const A = calculateA(data.turnoverData);
  const N = data.nValue;
  const B = calculateB(data.projects, N);
  const C = data.cValue;

  // Formula: (A * N * 2.5) - B + C
  const result = (A * N * 2.5) - B + C;
  return Number(result.toFixed(2));
};
