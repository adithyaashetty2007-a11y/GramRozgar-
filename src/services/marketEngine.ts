import { BUSINESS_TEMPLATES, DEMO_LOCATIONS } from '../data/demoData';
import { BusinessCategoryId, DemoLocation, MarketAnalysisResult } from '../types';

/**
 * Deterministic Market Engine
 *
 * Formulas:
 * 1. Demand Score:
 *    - Base demand is computed from the number of households in the panchayat catchment
 *      divided by the benchmark households per enterprise of this category.
 *    - Formula:
 *        idealUnits = households / benchmarkHouseholdsPerUnit
 *        demandRatio = idealUnits * categoryMultiplier * consumerSpendingIndex
 *        demandScore = clamp(round(demandRatio * 45), 25, 95)
 *
 * 2. Competition Score:
 *    - Based on ratio of existing businesses of this category in the panchayat relative to ideal capacity.
 *    - Formula:
 *        saturationRatio = existingCount / max(idealUnits, 1)
 *        competitionScore = clamp(round(saturationRatio * 50 + 15), 10, 95)
 *
 * 3. Market Potential Score:
 *    - Weighted combination of strong demand (60%) and low competition (40%).
 *    - Formula:
 *        marketPotential = round(0.6 * demandScore + 0.4 * (100 - competitionScore))
 *
 * 4. Confidence Level:
 *    - High if location data has verified household count >= 1000 and template is curated.
 *    - Medium if estimated from broader district.
 *    - Low if unverified custom data.
 */
export function calculateMarketAnalysis(
  categoryId: BusinessCategoryId,
  location: {
    isDemo: boolean;
    demoLocationId: string;
    panchayat: string;
    taluk: string;
    district: string;
  }
): MarketAnalysisResult {
  const template =
    BUSINESS_TEMPLATES.find((t) => t.id === categoryId) || BUSINESS_TEMPLATES[0];

  let locData: DemoLocation | undefined;
  if (location.isDemo && location.demoLocationId) {
    locData = DEMO_LOCATIONS.find((l) => l.id === location.demoLocationId);
  }
  if (!locData) {
    // Default fallback to first demo location with curated data
    locData = DEMO_LOCATIONS[0];
  }

  const existingCount = locData.businesses[categoryId] || 0;
  const households = locData.households;
  const benchmark = template.benchmarkHouseholdsPerUnit;
  const idealUnits = Math.max(1, households / benchmark);

  // Demand Score calculation
  const demandRaw = (idealUnits * template.categoryMultiplier * locData.consumerSpendingIndex * 45) / 2.5;
  const demandScore = Math.min(95, Math.max(25, Math.round(demandRaw)));

  // Competition Score calculation
  const saturationRatio = existingCount / idealUnits;
  const competitionScore = Math.min(95, Math.max(12, Math.round(saturationRatio * 52 + 18)));

  // Market Potential calculation
  const marketPotential = Math.round(0.6 * demandScore + 0.4 * (100 - competitionScore));

  // Confidence Level
  const confidence: 'High' | 'Medium' | 'Low' =
    households >= 1200 && location.isDemo ? 'High' : 'Medium';

  // Rationale explanations
  const rationaleEn: string[] = [
    `Local catchment of ${households.toLocaleString()} households supports an estimated ~${idealUnits.toFixed(0)} units for ${template.titleEn}.`,
    `Currently, there are ${existingCount} recorded existing units operating in ${locData.panchayat}.`,
    competitionScore > 65
      ? `Competition is relatively dense. Differentiation in quality, fresh stock, or doorstep delivery is recommended.`
      : `Competition level is manageable, leaving strong room for a customer-friendly new entrant.`,
  ];

  const rationaleKn: string[] = [
    `${locData.panchayat} ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ${households.toLocaleString()} ಕುಟುಂಬಗಳಿದ್ದು, ಸುಮಾರು ${idealUnits.toFixed(0)} ${template.titleKn} ಅಂಗಡಿಗಳಿಗೆ ಅವಕಾಶವಿದೆ.`,
    `ಪ್ರಸ್ತುತ ಈ ಭಾಗದಲ್ಲಿ ${existingCount} ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಘಟಕಗಳು ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿವೆ.`,
    competitionScore > 65
      ? `ಸ್ಪರ್ಧೆ ಸ್ವಲ್ಪ ಹೆಚ್ಚಾಗಿದ್ದು, ಗುಣಮಟ್ಟ, ವಿಶ್ವಾಸಾರ್ಹ ಸೇವೆ ಮತ್ತು ಗ್ರಾಹಕರೊಂದಿಗೆ ಉತ್ತಮ ಬಾಂಧವ್ಯ ಅಗತ್ಯ.`
      : `ಸ್ಪರ್ಧೆಯ ಮಟ್ಟ ಸಮತೋಲನದಲ್ಲಿದ್ದು, ಹೊಸ ಗ್ರಾಹಕರನ್ನು ಆಕರ್ಷಿಸಲು ಉತ್ತಮ ಅವಕಾಶವಿದೆ.`,
  ];

  return {
    locationName: `${locData.panchayat}, ${locData.taluk}`,
    population: locData.population,
    households: locData.households,
    existingBusinessesCount: existingCount,
    categoryName: template.titleEn,
    demandScore,
    competitionScore,
    marketPotential,
    confidence,
    rationaleEn,
    rationaleKn,
    isDemoData: true,
  };
}
