import { GOV_SCHEMES } from '../data/demoData';
import { BusinessCategoryId, GovScheme } from '../types';

export function matchGovernmentSchemes(
  categoryId: BusinessCategoryId,
  fundingGap: number
): GovScheme[] {
  return GOV_SCHEMES.filter((scheme) => {
    // Check if category is supported or scheme supports all
    const supportsCategory =
      scheme.supportedCategories.includes(categoryId) ||
      scheme.supportedCategories.includes('all');

    return supportsCategory;
  }).sort((a, b) => {
    // Prioritize schemes with subsidy
    const subA = a.subsidyPercentage || 0;
    const subB = b.subsidyPercentage || 0;
    return subB - subA;
  });
}
