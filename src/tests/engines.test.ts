/**
 * GramRozgar Deterministic Engines & Invariants Test Suite
 */

import { calculateMarketAnalysis } from '../services/marketEngine';
import { calculateFinancialAnalysis, simulateScenario } from '../services/financeEngine';
import { evaluateBusinessRisks } from '../services/riskEngine';
import { matchGovernmentSchemes } from '../services/schemeEngine';
import { FinancialAssumptions } from '../types';

export function runAllTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      results.push(`✅ PASS: ${testName}`);
    } else {
      failed++;
      results.push(`❌ FAIL: ${testName}`);
      console.error(`Failed test: ${testName}`);
    }
  }

  // 1. Finance Tests
  const baseAssumptions: FinancialAssumptions = {
    projectCost: 150000,
    userCapital: 100000,
    monthlyRevenue: 65000,
    monthlyExpenses: 46000,
    interestRate: 9.5,
    loanTenureMonths: 36,
  };

  const fin = calculateFinancialAnalysis(baseAssumptions);

  assert(fin.fundingGap === 50000, 'Finance: Funding gap is 150,000 - 100,000 = 50,000');
  assert(fin.monthlySurplus === 19000, 'Finance: Monthly surplus is 65,000 - 46,000 = 19,000');
  assert(fin.monthlyEmi > 1500 && fin.monthlyEmi < 1800, 'Finance: 50,000 loan at 9.5% for 36 months has valid EMI (~1600)');
  assert(fin.netCashBuffer > 17000, 'Finance: Net cash buffer covers operational safety (>17,000)');
  assert(fin.breakEvenMonths === 8, 'Finance: Break-even is ceil(150,000 / 19,000) = 8 months');
  assert(fin.affordabilityStatus === 'Healthy', 'Finance: Low EMI to surplus ratio yields Healthy status');

  // Stress Case Tests
  assert(fin.stressCase.revenue === 52000, 'Finance Stress: -20% revenue equals 52,000');
  assert(fin.stressCase.expenses === 50600, 'Finance Stress: +10% expenses equals 50,600');
  assert(fin.stressCase.surplus === 1400, 'Finance Stress: Stress surplus is positive (1,400)');

  // What-If Simulation
  const simulatedStress = simulateScenario(baseAssumptions, {
    revenuePercentDelta: -20,
    expensePercentDelta: 10,
  });
  assert(simulatedStress.monthlyRevenue === 52000, 'Simulator: Revenue delta applied accurately');
  assert(simulatedStress.monthlyExpenses === 50600, 'Simulator: Expense delta applied accurately');

  // 2. Market Engine Tests
  const market = calculateMarketAnalysis('dairy_shop', {
    isDemo: true,
    demoLocationId: 'ujire_belthangady',
    panchayat: 'Ujire Gram Panchayat',
    taluk: 'Belthangady',
    district: 'Dakshina Kannada',
  });

  assert(market.demandScore >= 25 && market.demandScore <= 95, 'Market: Demand score is bounded [25, 95]');
  assert(market.competitionScore >= 10 && market.competitionScore <= 95, 'Market: Competition score is bounded [10, 95]');
  assert(market.marketPotential >= 0 && market.marketPotential <= 100, 'Market: Market potential is within [0, 100]');
  assert(market.confidence === 'High', 'Market: High confidence for curated Panchayat with > 1200 households');

  // 3. Risk Engine Tests
  const risks = evaluateBusinessRisks(market, fin);
  assert(risks.overallRiskLevel === 'Low' || risks.overallRiskLevel === 'Medium', 'Risk: Realistic rural dairy scenario is Low or Medium risk');
  assert(risks.thingsToVerifyEn.length >= 3, 'Risk: Provides actionable ground verification points');

  // Extreme High-Risk Test
  const highRiskFin = calculateFinancialAnalysis({
    projectCost: 500000,
    userCapital: 20000,
    monthlyRevenue: 25000,
    monthlyExpenses: 24000,
    interestRate: 14,
    loanTenureMonths: 24,
  });
  const highRiskResult = evaluateBusinessRisks(market, highRiskFin);
  assert(highRiskResult.overallRiskLevel === 'High', 'Risk: Extreme debt and low surplus triggers High Risk level');

  // 4. Scheme Engine Tests
  const schemes = matchGovernmentSchemes('dairy_shop', 50000);
  assert(schemes.length >= 2, 'Schemes: Matches multiple verified schemes for dairy');
  assert(schemes.some((s) => s.id === 'pm_mudra_shishu_kishore'), 'Schemes: Matches Mudra scheme');

  console.log(`[GramRozgar Tests] Completed: ${passed} passed, ${failed} failed.`);
  return { passed, failed, results };
}

// Auto-run if executed via tsx
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('engines.test.ts')) {
  runAllTests();
}
