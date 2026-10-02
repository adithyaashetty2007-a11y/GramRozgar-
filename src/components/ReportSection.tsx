import React, { useState } from 'react';
import {
  FinancialAnalysisResult,
  GovScheme,
  Language,
  MarketAnalysisResult,
  RiskAnalysisResult,
  UserInputState,
} from '../types';
import { T } from '../services/translations';
import {
  Printer,
  Copy,
  BookmarkCheck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Calendar,
  Building,
} from 'lucide-react';

interface ReportSectionProps {
  inputs: UserInputState;
  market: MarketAnalysisResult;
  finance: FinancialAnalysisResult;
  risks: RiskAnalysisResult;
  schemes: GovScheme[];
  language: Language;
  onRestart: () => void;
  onSave: (userName: string) => Promise<boolean>;
  aiExplanation?: string;
}

export const ReportSection: React.FC<ReportSectionProps> = ({
  inputs,
  market,
  finance,
  risks,
  schemes,
  language,
  onRestart,
  onSave,
  aiExplanation,
}) => {
  const t = T[language];
  const isKn = language === 'kn';

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState('');
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const reportSummary = `GRAMROZGAR BUSINESS ADVISORY REPORT
Business: ${inputs.businessIdea}
Location: ${market.locationName}
Available Capital: ₹${finance.userCapital.toLocaleString()}

MARKET POTENTIAL: ${market.marketPotential}/100 (Demand: ${market.demandScore}, Competition: ${market.competitionScore})
FINANCIAL FEASIBILITY:
- Project Cost: ₹${finance.projectCost.toLocaleString()}
- Funding Gap / Loan: ₹${finance.fundingGap.toLocaleString()}
- Expected Monthly Revenue: ₹${finance.monthlyRevenue.toLocaleString()}
- Monthly Expenses: ₹${finance.monthlyExpenses.toLocaleString()}
- Monthly Operating Surplus: ₹${finance.monthlySurplus.toLocaleString()}
- Monthly Bank EMI: ₹${finance.monthlyEmi.toLocaleString()}
- Monthly Safety Cushion Buffer: ₹${finance.netCashBuffer.toLocaleString()}
- Break-Even: ~${finance.breakEvenMonths} months

RISK PROFILE: ${risks.overallRiskLevel}
RECOMMENDED SCHEMES: ${schemes.slice(0, 2).map((s) => s.schemeName).join(', ')}

Trust Principle: Data provides the evidence · Code performs calculations · AI explains the results.`;

    navigator.clipboard.writeText(reportSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSaveClick = async () => {
    if (!userName.trim()) {
      setShowSavePrompt(true);
      return;
    }
    setIsSaving(true);
    const ok = await onSave(userName.trim());
    setIsSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setShowSavePrompt(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t.downloadPdf}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all cursor-pointer"
          >
            <Copy className="w-4 h-4 text-stone-600" />
            <span>{copied ? (isKn ? 'ಕಾಪಿ ಮಾಡಲಾಗಿದೆ!' : 'Copied!') : t.copySummary}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess ? (
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {t.savedSuccess}
            </span>
          ) : (
            <button
              onClick={() => setShowSavePrompt(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold transition-all cursor-pointer"
            >
              <BookmarkCheck className="w-4 h-4 text-stone-600" />
              <span>{t.saveThisBusiness}</span>
            </button>
          )}

          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.startNewAnalysis}</span>
          </button>
        </div>
      </div>

      {/* Save Modal Prompt */}
      {showSavePrompt && (
        <div className="no-print p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-emerald-950">
            {t.enterNamePrompt}
          </span>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="e.g. Ramesh K / 9876543210"
            className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-medium focus:outline-hidden focus:border-emerald-700"
          />
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Confirm Save'}
          </button>
          <button
            onClick={() => setShowSavePrompt(false)}
            className="text-xs text-stone-500 hover:underline cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* PRINTABLE OFFICIAL BUSINESS REPORT */}
      <div className="bg-white rounded-3xl border border-stone-300 p-8 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-stone-900 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">
                Official Advisory Document
              </span>
              <h1 className="text-3xl font-extrabold text-stone-950 font-serif tracking-tight mt-0.5">
                {t.brandName}
              </h1>
              <p className="text-xs font-semibold text-stone-600 mt-1">
                {t.tagline}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-stone-500 font-mono space-y-1">
              <div>Ref: GR-{Date.now().toString().slice(-6)}</div>
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>Mode: Demo / Prototype Dataset</div>
            </div>
          </div>

          {/* Core Trust Principle Badge */}
          <div className="mt-4 p-2.5 rounded-lg bg-stone-100 text-stone-800 text-[11px] font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
              {t.trustPillar}
            </span>
            <span className="text-[10px] text-stone-500">v2026.10</span>
          </div>
        </div>

        {/* Business Summary Header */}
        <div className="py-6 border-b border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Business Proposed
            </span>
            <div className="text-base font-bold text-stone-900 mt-0.5">
              {inputs.businessIdea}
            </div>
            <span className="text-xs text-stone-500">
              Category: {market.categoryName}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Location / Catchment
            </span>
            <div className="text-base font-bold text-stone-900 mt-0.5">
              {market.locationName}
            </div>
            <span className="text-xs text-stone-500">
              {market.households} Households · {market.population} Pop.
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Entrepreneur Capital
            </span>
            <div className="text-base font-bold text-emerald-900 mt-0.5 font-mono">
              ₹{finance.userCapital.toLocaleString()}
            </div>
            <span className="text-xs text-stone-500">
              Borrowing: ₹{finance.fundingGap.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Executive Feasibility Scores */}
        <div className="py-6 border-b border-stone-200">
          <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-4">
            1. Executive Feasibility Summary
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 block">
                Market Potential
              </span>
              <span className="text-2xl font-extrabold text-stone-900 font-mono">
                {market.marketPotential} / 100
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                Demand: {market.demandScore} · Comp: {market.competitionScore}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 block">
                Financial Affordability
              </span>
              <span className="text-lg font-extrabold text-emerald-800 block mt-1">
                {finance.affordabilityStatus}
              </span>
              <span className="text-[10px] text-stone-500 block">
                Debt Ratio: {finance.affordabilityRatio}%
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 block">
                Monthly Net Buffer
              </span>
              <span className="text-2xl font-extrabold text-emerald-900 font-mono">
                ₹{finance.netCashBuffer.toLocaleString()}
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                Surplus minus EMI
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 block">
                Risk Classification
              </span>
              <span
                className={`text-lg font-extrabold block mt-1 ${
                  risks.overallRiskLevel === 'Low'
                    ? 'text-emerald-800'
                    : risks.overallRiskLevel === 'Medium'
                    ? 'text-amber-800'
                    : 'text-rose-800'
                }`}
              >
                {risks.overallRiskLevel} Risk
              </span>
              <span className="text-[10px] text-stone-500 block">
                Deterministic Score: {risks.overallScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown Table */}
        <div className="py-6 border-b border-stone-200">
          <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-4">
            2. Detailed Financial Architecture (Deterministic)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-300 font-bold text-stone-600 bg-stone-50">
                  <th className="py-2 px-3">Financial Metric</th>
                  <th className="py-2 px-3 font-mono text-right">Calculated Value</th>
                  <th className="py-2 px-3">Underlying Logic & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-medium text-stone-800">
                <tr>
                  <td className="py-2 px-3">Total Estimated Setup Cost</td>
                  <td className="py-2 px-3 font-mono font-bold text-right">
                    ₹{finance.projectCost.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-stone-500">
                    Machinery, deposit, working capital inventory
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Entrepreneur Self Contribution</td>
                  <td className="py-2 px-3 font-mono text-emerald-800 text-right">
                    ₹{finance.userCapital.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-stone-500">
                    {(
                      (finance.userCapital / Math.max(1, finance.projectCost)) *
                      100
                    ).toFixed(0)}
                    % equity share
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3">External Loan Requirement (Gap)</td>
                  <td className="py-2 px-3 font-mono text-amber-900 text-right font-bold">
                    ₹{finance.loanAmount.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-stone-500">
                    Targeted for MUDRA / PMEGP credit linkage
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Monthly Operating Revenue</td>
                  <td className="py-2 px-3 font-mono text-right">
                    ₹{finance.monthlyRevenue.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-stone-500">
                    Based on local Panchayat population spending index
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Monthly Operating Expenses</td>
                  <td className="py-2 px-3 font-mono text-right">
                    ₹{finance.monthlyExpenses.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-stone-500">
                    Stock procurement, utilities, transport & labor
                  </td>
                </tr>
                <tr className="bg-stone-50/60 font-semibold">
                  <td className="py-2 px-3">Operating Monthly Surplus</td>
                  <td className="py-2 px-3 font-mono text-right">
                    ₹{finance.monthlySurplus.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-stone-500">
                    Pre-EMI cash earnings
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Equated Monthly Installment (EMI)</td>
                  <td className="py-2 px-3 font-mono text-right">
                    ₹{finance.monthlyEmi.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-stone-500">
                    Amortized over {finance.loanTenureMonths} months @{' '}
                    {finance.interestRate}% p.a.
                  </td>
                </tr>
                <tr className="bg-emerald-50/50 font-bold text-emerald-950">
                  <td className="py-2.5 px-3">Net Cash Buffer After EMI</td>
                  <td className="py-2.5 px-3 font-mono text-right text-sm">
                    ₹{finance.netCashBuffer.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-800">
                    Surplus retained in hand each month
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Estimated Break-Even Horizon</td>
                  <td className="py-2 px-3 font-mono text-right">
                    ~{finance.breakEvenMonths} months
                  </td>
                  <td className="py-2 px-3 text-stone-500">
                    Capital recovery timeline
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Government Schemes & Subsidies */}
        <div className="py-6 border-b border-stone-200">
          <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
            3. Recommended Government Support Schemes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {schemes.slice(0, 2).map((scheme) => (
              <div
                key={scheme.id}
                className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span>{isKn ? scheme.nameKn : scheme.schemeName}</span>
                  {(scheme.subsidyPercentage || 0) > 0 && (
                    <span className="text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-sm">
                      {scheme.subsidyPercentage}% Subsidy
                    </span>
                  )}
                </div>
                <p className="mt-1 text-stone-600 text-[11px]">
                  {isKn ? scheme.purposeKn : scheme.purposeEn}
                </p>
                <div className="mt-2 text-[10px] text-stone-400">
                  Verified Official Portal: {scheme.officialSource}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Explanatory Notes & Practical Steps */}
        <div className="py-6 border-b border-stone-200 space-y-3">
          <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            4. Advisory Guidance & Practical Next Steps
          </h2>

          <div className="text-xs text-stone-700 leading-relaxed space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200">
            {aiExplanation ? (
              <div className="whitespace-pre-line">{aiExplanation}</div>
            ) : (
              <div>
                <p className="font-semibold text-stone-900">
                  Ground Advisory Summary:
                </p>
                <p className="mt-1">
                  Based on the demographic profile of {market.locationName}, this{' '}
                  {market.categoryName} displays viable potential with manageable
                  saturation ({market.existingBusinessesCount} units active).
                  Maintain strict control over credit/advance to customers, and
                  utilize MUDRA or PMEGP margin subsidy to lower debt costs.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Official Advisory Notice Footer */}
        <div className="pt-6 text-[11px] text-stone-500 leading-relaxed">
          <p className="font-semibold text-stone-700">Official Notice:</p>
          <p className="mt-0.5">{t.disclaimerText}</p>
        </div>
      </div>
    </div>
  );
};
