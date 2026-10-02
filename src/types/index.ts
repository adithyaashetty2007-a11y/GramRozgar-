export type Language = 'en' | 'kn';

export type BusinessCategoryId =
  | 'dairy_shop'
  | 'kirana_store'
  | 'poultry_farm'
  | 'tailoring_shop'
  | 'rural_food_stall'
  | 'flour_mill'
  | 'two_wheeler_repair'
  | 'mobile_electronics'
  | 'handicrafts_weaving'
  | 'food_processing'
  | 'custom_other';

export interface BusinessTemplate {
  id: BusinessCategoryId;
  titleEn: string;
  titleKn: string;
  categoryTag: string;
  defaultProjectCost: number;
  defaultMonthlyRevenue: number;
  defaultMonthlyExpenses: number;
  benchmarkHouseholdsPerUnit: number;
  categoryMultiplier: number;
  descriptionEn: string;
  descriptionKn: string;
  iconName: string;
}

export interface DemoLocation {
  id: string;
  panchayat: string;
  taluk: string;
  district: string;
  state: string;
  population: number;
  households: number;
  businesses: Record<string, number>;
  consumerSpendingIndex: number; // 0.8 to 1.3
}

export interface UserInputState {
  businessIdea: string;
  categoryId: BusinessCategoryId;
  location: {
    isDemo: boolean;
    demoLocationId: string;
    state: string;
    district: string;
    taluk: string;
    panchayat: string;
    coordinates?: { lat: number; lng: number };
  };
  capital: number;
  loanRequested?: number;
  additionalDetails?: string;
  language: Language;
}

export interface MarketAnalysisResult {
  locationName: string;
  population: number;
  households: number;
  existingBusinessesCount: number;
  categoryName: string;
  demandScore: number; // 0-100
  competitionScore: number; // 0-100
  marketPotential: number; // 0-100
  confidence: 'High' | 'Medium' | 'Low';
  rationaleEn: string[];
  rationaleKn: string[];
  isDemoData: boolean;
}

export interface FinancialAssumptions {
  projectCost: number;
  userCapital: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  interestRate: number; // e.g. 9.5%
  loanTenureMonths: number; // e.g. 36
}

export interface FinancialAnalysisResult {
  projectCost: number;
  userCapital: number;
  fundingGap: number;
  loanAmount: number;
  interestRate: number;
  loanTenureMonths: number;
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  netCashBuffer: number;
  affordabilityRatio: number; // EMI / surplus %
  affordabilityStatus: 'Healthy' | 'Moderate' | 'Stressed';
  breakEvenMonths: number;
  paybackPeriodMonths: number;
  // What-If stress case
  stressCase: {
    revenue: number;
    expenses: number;
    surplus: number;
    netBuffer: number;
    isSolvent: boolean;
  };
}

export interface GovScheme {
  id: string;
  schemeName: string;
  nameKn: string;
  purposeEn: string;
  purposeKn: string;
  supportedCategories: string[];
  eligibilityEn: string[];
  eligibilityKn: string[];
  assistanceEn: string;
  assistanceKn: string;
  subsidyPercentage?: number;
  maxLoanAmount?: number;
  documentsEn: string[];
  documentsKn: string[];
  officialSource: string;
  lastVerified: string;
}

export interface RiskAnalysisResult {
  overallRiskLevel: 'Low' | 'Medium' | 'High';
  overallScore: number; // 0-100 (lower is safer)
  risks: Array<{
    titleEn: string;
    titleKn: string;
    severity: 'high' | 'medium' | 'low';
    mitigationEn: string;
    mitigationKn: string;
  }>;
  positiveIndicators: Array<{
    titleEn: string;
    titleKn: string;
  }>;
  thingsToVerifyEn: string[];
  thingsToVerifyKn: string[];
}

export interface NextStepItem {
  id: number;
  titleEn: string;
  titleKn: string;
  detailEn: string;
  detailKn: string;
  completed?: boolean;
}

export interface SavedAnalysisRecord {
  id: string;
  createdAt: string;
  businessTitle: string;
  locationName: string;
  capital: number;
  inputs: UserInputState;
  market: MarketAnalysisResult;
  finance: FinancialAnalysisResult;
  assumptions: FinancialAssumptions;
  risks: RiskAnalysisResult;
  feasibilityScore: number;
}
