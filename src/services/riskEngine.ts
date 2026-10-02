import { FinancialAnalysisResult, MarketAnalysisResult, RiskAnalysisResult } from '../types';

/**
 * Deterministic Risk Engine
 *
 * Rules:
 * - High Competition: competitionScore >= 70
 * - Low Demand: demandScore < 45
 * - High Funding Requirement: fundingGap > userCapital * 2
 * - Tight Cash Buffer: netCashBuffer < 4000
 * - High EMI Burden: affordabilityRatio > 65%
 * - Negative Stress-Case Surplus: stressNetBuffer < 0
 */
export function evaluateBusinessRisks(
  market: MarketAnalysisResult,
  finance: FinancialAnalysisResult
): RiskAnalysisResult {
  const risks: Array<{
    titleEn: string;
    titleKn: string;
    severity: 'high' | 'medium' | 'low';
    mitigationEn: string;
    mitigationKn: string;
  }> = [];

  const positiveIndicators: Array<{
    titleEn: string;
    titleKn: string;
  }> = [];

  let riskPoints = 0;

  // 1. Competition check
  if (market.competitionScore >= 70) {
    riskPoints += 30;
    risks.push({
      titleEn: `Dense local competition (${market.existingBusinessesCount} units already active)`,
      titleKn: `ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಹೆಚ್ಚಿನ ಸ್ಪರ್ಧೆ (${market.existingBusinessesCount} ಅಂಗಡಿಗಳು ಈಗಾಗಲೆ ಇವೆ)`,
      severity: 'high',
      mitigationEn:
        'Focus on superior customer relationships, fresher items, digital UPI payments, and doorstep supply to regular households.',
      mitigationKn:
        'ಗ್ರಾಹಕರೊಂದಿಗೆ ಉತ್ತಮ ಸ್ನೇಹ, ತಾಜಾ ಸರಕುಗಳು, ಯುಪಿಐ ಪಾವತಿ ಮತ್ತು ನಿಗದಿತ ಮನೆಗಳಿಗೆ ಸರಬರಾಜು ಮಾಡುವ ಮೂಲಕ ವ್ಯತ್ಯಾಸ ತೋರಿಸಿ.',
    });
  } else if (market.competitionScore <= 35) {
    positiveIndicators.push({
      titleEn: 'Low competitor saturation in this Gram Panchayat',
      titleKn: 'ಈ ಗ್ರಾಮ ಪಂಚಾಯತ್ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಕಡಿಮೆ ಸ್ಪರ್ಧೆ ಮತ್ತು ಹೆಚ್ಚು ಸ್ಥಳೀಯ ಅವಕಾಶ',
    });
  }

  // 2. Market Demand check
  if (market.demandScore >= 65) {
    positiveIndicators.push({
      titleEn: `Healthy local demand backed by ~${market.households} households`,
      titleKn: `ಸುಮಾರು ${market.households} ಕುಟುಂಬಗಳ ದೈನಂದಿನ ಅಗತ್ಯದಿಂದ ಉತ್ತಮ ಬೇಡಿಕೆ`,
    });
  } else if (market.demandScore < 45) {
    riskPoints += 25;
    risks.push({
      titleEn: 'Limited household density for this business model',
      titleKn: 'ಈ ವ್ಯವಹಾರಕ್ಕೆ ಸೂಕ್ತವಾದ ಗ್ರಾಹಕ ಕುಟುಂಬಗಳ ಸಂಖ್ಯೆ ಕಡಿಮೆ ಇದೆ',
      severity: 'medium',
      mitigationEn:
        'Expand delivery radius to neighboring hamlets or offer complementary services.',
      mitigationKn:
        'ಹತ್ತಿರದ ಪಕ್ಕದ ಹಳ್ಳಿಗಳಿಗೂ ಸರಕು ಅಥವಾ ಸೇವೆಯನ್ನು ವಿಸ್ತರಿಸಲು ಯೋಜನೆ ಮಾಡಿ.',
    });
  }

  // 3. Funding Gap check
  if (finance.fundingGap > finance.userCapital * 2) {
    riskPoints += 25;
    risks.push({
      titleEn: 'High debt dependency (Borrowing over 66% of total project cost)',
      titleKn: 'ಹೆಚ್ಚಿನ ಸಾಲದ ಅವಲಂಬನೆ (ಬಂಡವಾಳಕ್ಕಿಂತ 2 ಪಟ್ಟು ಹೆಚ್ಚು ಸಾಲದ ಅಗತ್ಯವಿದೆ)',
      severity: 'high',
      mitigationEn:
        'Apply for PMEGP 35% capital subsidy or combine savings with family/SHG seed support to reduce loan burden.',
      mitigationKn:
        'PMEGP 35% ಸಬ್ಸಿಡಿ ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ ಅಥವಾ ಸ್ವಸಹಾಯ ಸಂಘದ ನೆರವು ಪಡೆದು ಬ್ಯಾಂಕ್ ಸಾಲದ ಮೊತ್ತವನ್ನು ಕಡಿಮೆ ಮಾಡಿ.',
    });
  } else if (finance.fundingGap === 0) {
    positiveIndicators.push({
      titleEn: 'Zero loan required - Fully funded from personal savings',
      titleKn: 'ಯಾವುದೇ ಸಾಲದ ಅಗತ್ಯವಿಲ್ಲ - ಸಂಪೂರ್ಣ ಸ್ವಂತ ಬಂಡವಾಳದಿಂದ ಆರಂಭಿಸಬಹುದು',
    });
  }

  // 4. Cash Buffer & Affordability
  if (finance.netCashBuffer < 3500) {
    riskPoints += 25;
    risks.push({
      titleEn: `Slim monthly safety cushion (₹${finance.netCashBuffer.toLocaleString()} remaining after EMI)`,
      titleKn: `ಕಡಿಮೆ ಮಾಸಿಕ ಉಳಿತಾಯ (ಇಎಂಐ ನಂತರ ಉಳಿಯುವುದು ಕೇವಲ ₹${finance.netCashBuffer.toLocaleString()})`,
      severity: 'high',
      mitigationEn:
        'Negotiate longer loan tenure (e.g. 5 years instead of 3 years) to decrease monthly EMI installment.',
      mitigationKn:
        'ಇಎಂಐ ಕಂತು ಕಡಿಮೆ ಮಾಡಲು ಸಾಲದ ಅವಧಿಯನ್ನು 3 ವರ್ಷದಿಂದ 5 ವರ್ಷಕ್ಕೆ ವಿಸ್ತರಿಸುವಂತೆ ಬ್ಯಾಂಕ್‌ನಲ್ಲಿ ವಿನಂತಿಸಿ.',
    });
  } else if (finance.netCashBuffer >= 8000) {
    positiveIndicators.push({
      titleEn: `Strong cash buffer of ₹${finance.netCashBuffer.toLocaleString()}/month to absorb slower seasons`,
      titleKn: `ಪ್ರತಿ ತಿಂಗಳು ₹${finance.netCashBuffer.toLocaleString()} ಸುರಕ್ಷಿತ ಉಳಿತಾಯವಿರುವುದರಿಂದ ನಿರಾತಂಕ ವ್ಯವಹಾರ`,
    });
  }

  // 5. Stress Case viability
  if (!finance.stressCase.isSolvent) {
    riskPoints += 20;
    risks.push({
      titleEn: 'Vulnerable under 20% revenue drop (Deficit in stress scenario)',
      titleKn: 'ವಹಿವಾಟು 20% ಕುಸಿದರೆ ಸಾಲ ತೀರಿಸಲು ಕಷ್ಟವಾಗಬಹುದು (ತೊಂದರೆ ಸಂದರ್ಭ)',
      severity: 'medium',
      mitigationEn:
        'Keep 2 months of operational expenses (approx ₹30,000) as emergency reserve before starting.',
      mitigationKn:
        'ವ್ಯವಹಾರ ಆರಂಭಿಸುವ ಮುನ್ನ ಕನಿಷ್ಠ 2 ತಿಂಗಳ ಖರ್ಚಿಗೆ ಬೇಕಾದ ₹30,000 ತುರ್ತು ಹಣವನ್ನು ಕೈಯಲ್ಲಿ ಇಟ್ಟುಕೊಳ್ಳಿ.',
    });
  } else {
    positiveIndicators.push({
      titleEn: 'Resilient model: Stays cash-positive even with a 20% drop in revenue',
      titleKn: '20% ವ್ಯಾಪಾರ ಕಡಿಮೆಯಾದರೂ ಸಾಲದ ಕಂತು ಕಟ್ಟಿ ಲಾಭ ಉಳಿಸಿಕೊಳ್ಳುವ ಸಾಮರ್ಥ್ಯವಿದೆ',
    });
  }

  // Overall Risk Level
  let overallRiskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (riskPoints >= 55) {
    overallRiskLevel = 'High';
  } else if (riskPoints >= 25) {
    overallRiskLevel = 'Medium';
  }

  const thingsToVerifyEn = [
    'Confirm rent agreement with shop owner for minimum 3 years before paying deposit',
    'Verify electricity power continuity and 3-phase supply if operating machinery',
    'Speak to at least 15 local village households regarding preferred product brands/services',
    'Inquire with Gram Panchayat Secretary for local trade license / NOC guidelines',
  ];

  const thingsToVerifyKn = [
    'ಅಂಗಡಿ ಬಾಡಿಗೆ ನೀಡುವವರೊಂದಿಗೆ ಕನಿಷ್ಠ 3 ವರ್ಷಗಳ ಲಿಖಿತ ಒಪ್ಪಂದ ಮಾಡಿಕೊಳ್ಳಿ',
    'ಯಂತ್ರೋಪಕರಣಗಳಿದ್ದರೆ 3-ಫೇಸ್ ಕರೆಂಟ್ ಸೌಲಭ್ಯ ಸರಿಯಾಗಿದೆಯೇ ಪರೀಕ್ಷಿಸಿ',
    'ಕನಿಷ್ಠ 15-20 ಗ್ರಾಮಸ್ಥರೊಂದಿಗೆ ಮಾತನಾಡಿ ಅವರಿಗೆ ಯಾವ ವಸ್ತುಗಳ ಅಗತ್ಯವಿದೆ ಎಂದು ತಿಳಿಯಿರಿ',
    'ಗ್ರಾಮ ಪಂಚಾಯತ್ ಅಭಿವೃದ್ಧಿ ಅಧಿಕಾರಿಯನ್ನು (PDO) ಭೇಟಿ ಮಾಡಿ ವ್ಯಾಪಾರ ಪರವಾನಗಿ ಬಗ್ಗೆ ವಿಚಾರಿಸಿ',
  ];

  return {
    overallRiskLevel,
    overallScore: Math.min(100, riskPoints),
    risks,
    positiveIndicators,
    thingsToVerifyEn,
    thingsToVerifyKn,
  };
}
