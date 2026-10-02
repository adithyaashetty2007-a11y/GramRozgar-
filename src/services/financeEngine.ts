import { FinancialAnalysisResult, FinancialAssumptions } from '../types';

/**
 * Deterministic Financial Engine
 *
 * Formulas:
 * 1. Funding Gap:
 *    fundingGap = max(0, projectCost - userCapital)
 *
 * 2. Monthly EMI (Equated Monthly Installment):
 *    P = loanAmount
 *    r = annualInterestRate / 12 / 100
 *    n = loanTenureMonths
 *    EMI = (P * r * (1 + r)^n) / ((1 + r)^n - 1)
 *
 * 3. Monthly Surplus (Operating Profit):
 *    monthlySurplus = monthlyRevenue - monthlyExpenses
 *
 * 4. Net Cash Buffer:
 *    netCashBuffer = monthlySurplus - monthlyEmi
 *
 * 5. Affordability Ratio:
 *    affordabilityRatio = (monthlyEmi / max(1, monthlySurplus)) * 100
 *    - Healthy: <= 50%
 *    - Moderate: 50% - 75%
 *    - Stressed: > 75% or surplus <= 0
 *
 * 6. Break-Even Period (Months):
 *    breakEvenMonths = monthlySurplus > 0 ? round(projectCost / monthlySurplus) : 999
 *
 * 7. Stress Case Analysis:
 *    stressRevenue = monthlyRevenue * 0.8  (-20%)
 *    stressExpenses = monthlyExpenses * 1.1 (+10%)
 *    stressSurplus = stressRevenue - stressExpenses
 *    stressNetBuffer = stressSurplus - monthlyEmi
 */
export function calculateFinancialAnalysis(
  assumptions: FinancialAssumptions
): FinancialAnalysisResult {
  const {
    projectCost,
    userCapital,
    monthlyRevenue,
    monthlyExpenses,
    interestRate,
    loanTenureMonths,
  } = assumptions;

  const fundingGap = Math.max(0, projectCost - userCapital);
  const loanAmount = fundingGap;

  let monthlyEmi = 0;
  let totalRepayment = 0;
  let totalInterest = 0;

  if (loanAmount > 0 && loanTenureMonths > 0) {
    const monthlyRate = interestRate / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, loanTenureMonths);
    if (factor > 1) {
      monthlyEmi = Math.round((loanAmount * monthlyRate * factor) / (factor - 1));
      totalRepayment = monthlyEmi * loanTenureMonths;
      totalInterest = Math.max(0, totalRepayment - loanAmount);
    }
  }

  const monthlySurplus = monthlyRevenue - monthlyExpenses;
  const netCashBuffer = monthlySurplus - monthlyEmi;

  const affordabilityRatio =
    monthlySurplus > 0
      ? Math.min(150, Math.round((monthlyEmi / monthlySurplus) * 100))
      : 150;

  let affordabilityStatus: 'Healthy' | 'Moderate' | 'Stressed' = 'Healthy';
  if (monthlySurplus <= 0 || affordabilityRatio > 75 || netCashBuffer < 2500) {
    affordabilityStatus = 'Stressed';
  } else if (affordabilityRatio > 50 || netCashBuffer < 6000) {
    affordabilityStatus = 'Moderate';
  }

  const breakEvenMonths =
    monthlySurplus > 0 ? Math.ceil(projectCost / monthlySurplus) : 99;

  const paybackPeriodMonths =
    netCashBuffer > 0 ? Math.ceil(projectCost / netCashBuffer) : 99;

  // What-If 20% revenue stress, 10% inflation expense stress
  const stressRev = Math.round(monthlyRevenue * 0.8);
  const stressExp = Math.round(monthlyExpenses * 1.1);
  const stressSurplus = stressRev - stressExp;
  const stressNetBuffer = stressSurplus - monthlyEmi;

  return {
    projectCost,
    userCapital,
    fundingGap,
    loanAmount,
    interestRate,
    loanTenureMonths,
    monthlyEmi,
    totalInterest,
    totalRepayment,
    monthlyRevenue,
    monthlyExpenses,
    monthlySurplus,
    netCashBuffer,
    affordabilityRatio,
    affordabilityStatus,
    breakEvenMonths,
    paybackPeriodMonths,
    stressCase: {
      revenue: stressRev,
      expenses: stressExp,
      surplus: stressSurplus,
      netBuffer: stressNetBuffer,
      isSolvent: stressNetBuffer >= 0,
    },
  };
}

/**
 * Dedicated What-If Scenario Simulator with custom modifiers
 */
export function simulateScenario(
  baseAssumptions: FinancialAssumptions,
  modifiers: {
    revenuePercentDelta: number; // e.g. -20, -10, 0, 10
    expensePercentDelta: number; // e.g. -10, 0, +10, +20
    loanAmountOverride?: number;
    interestRateOverride?: number;
    tenureOverride?: number;
  }
): FinancialAnalysisResult {
  const adjustedRevenue = Math.round(
    baseAssumptions.monthlyRevenue * (1 + modifiers.revenuePercentDelta / 100)
  );
  const adjustedExpenses = Math.round(
    baseAssumptions.monthlyExpenses * (1 + modifiers.expensePercentDelta / 100)
  );
  const adjustedProjectCost =
    modifiers.loanAmountOverride !== undefined
      ? baseAssumptions.userCapital + modifiers.loanAmountOverride
      : baseAssumptions.projectCost;

  return calculateFinancialAnalysis({
    ...baseAssumptions,
    projectCost: adjustedProjectCost,
    monthlyRevenue: Math.max(1000, adjustedRevenue),
    monthlyExpenses: Math.max(500, adjustedExpenses),
    interestRate: modifiers.interestRateOverride ?? baseAssumptions.interestRate,
    loanTenureMonths: modifiers.tenureOverride ?? baseAssumptions.loanTenureMonths,
  });
}
