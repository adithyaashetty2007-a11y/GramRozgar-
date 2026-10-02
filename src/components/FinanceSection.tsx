import React from 'react';
import { FinancialAnalysisResult, FinancialAssumptions, Language } from '../types';
import { T } from '../services/translations';
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Sliders,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface FinanceSectionProps {
  finance: FinancialAnalysisResult;
  assumptions: FinancialAssumptions;
  onUpdateAssumptions: (newAssumptions: FinancialAssumptions) => void;
  language: Language;
  onNext: () => void;
}

export const FinanceSection: React.FC<FinanceSectionProps> = ({
  finance,
  assumptions,
  onUpdateAssumptions,
  language,
  onNext,
}) => {
  const t = T[language];
  const isKn = language === 'kn';

  // Incremental adjustments
  const adjustValue = (key: keyof FinancialAssumptions, delta: number, min = 0) => {
    const current = assumptions[key];
    const updated = Math.max(min, current + delta);
    onUpdateAssumptions({
      ...assumptions,
      [key]: updated,
    });
  };

  const getAffordabilityBadge = () => {
    switch (finance.affordabilityStatus) {
      case 'Healthy':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isKn ? 'ಸುರಕ್ಷಿತ (Healthy)' : 'Healthy Affordability'}
          </span>
        );
      case 'Moderate':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" />
            {isKn ? 'ಮಧ್ಯಮ (Moderate)' : 'Moderate Affordability'}
          </span>
        );
      case 'Stressed':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            {isKn ? 'ಎಚ್ಚರಿಕೆ (Stressed)' : 'Stressed / High Debt'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            {t.demoModeBadge}
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
            {t.financeHeading}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-600">
            {t.financeSubheading}
          </p>
        </div>

        <div>{getAffordabilityBadge()}</div>
      </div>

      {/* Primary Financial Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Project Cost */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <span className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
            {t.projectCostLabel}
          </span>
          <div className="mt-2 text-2xl font-extrabold text-stone-900 font-mono">
            ₹{finance.projectCost.toLocaleString()}
          </div>
          <span className="mt-1 block text-[11px] text-stone-500">
            {isKn ? 'ಯಂತ್ರ, ಸರಕು ಮತ್ತು ಮುಂಗಡ' : 'Setup, machinery & stock'}
          </span>
        </div>

        {/* User Capital */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <span className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
            {t.userCapitalLabel}
          </span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-800 font-mono">
            ₹{finance.userCapital.toLocaleString()}
          </div>
          <span className="mt-1 block text-[11px] text-stone-500">
            {isKn ? 'ನಿಮ್ಮ ಸ್ವಂತ ಉಳಿತಾಯ ಹಣ' : 'Your personal investment'}
          </span>
        </div>

        {/* Funding Gap (Loan Amount) */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <span className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
            {t.fundingGapLabel}
          </span>
          <div className="mt-2 text-2xl font-extrabold text-amber-900 font-mono">
            ₹{finance.loanAmount.toLocaleString()}
          </div>
          <span className="mt-1 block text-[11px] text-stone-500">
            {finance.loanAmount > 0
              ? isKn
                ? 'ಮುದ್ರಾ ಅಥವಾ PMEGP ಸಾಲ'
                : 'MUDRA / PMEGP loan required'
              : isKn
              ? 'ಯಾವುದೇ ಸಾಲದ ಅಗತ್ಯವಿಲ್ಲ'
              : 'Zero external borrowing'}
          </span>
        </div>

        {/* Estimated Monthly EMI */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <span className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
            {t.estimatedEmiLabel}
          </span>
          <div className="mt-2 text-2xl font-extrabold text-stone-900 font-mono">
            ₹{finance.monthlyEmi.toLocaleString()}
          </div>
          <span className="mt-1 block text-[11px] text-stone-500">
            {finance.loanTenureMonths} {t.monthsUnit} @ {finance.interestRate}% p.a.
          </span>
        </div>
      </div>

      {/* Monthly Operations & Cash Flow Balance */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6">
        <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-5 flex items-center gap-1.5">
          <IndianRupee className="w-4 h-4 text-emerald-700" />
          {isKn ? 'ಮಾಸಿಕ ಹಣಕಾಸು ಹರಿವು (Monthly Cash Flow)' : 'Monthly Operations & Buffer'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Monthly Revenue */}
          <div className="bg-white p-5 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
              <span>{t.monthlyRevenueLabel}</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-3xl font-extrabold text-stone-900 font-mono">
              ₹{finance.monthlyRevenue.toLocaleString()}
            </div>
            <span className="mt-1 block text-xs text-stone-500">
              {isKn ? 'ದೈನಂದಿನ ವ್ಯಾಪಾರದ ಮೊತ್ತ' : 'Expected customer sales'}
            </span>
          </div>

          {/* Monthly Expenses */}
          <div className="bg-white p-5 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
              <span>{t.monthlyExpensesLabel}</span>
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </div>
            <div className="mt-2 text-3xl font-extrabold text-stone-900 font-mono">
              ₹{finance.monthlyExpenses.toLocaleString()}
            </div>
            <span className="mt-1 block text-xs text-stone-500">
              {isKn ? 'ಸರಕು, ವಿದ್ಯುತ್, ಕೂಲಿ ಮತ್ತು ಬಾಡಿಗೆ' : 'Stock, electricity & rent'}
            </span>
          </div>

          {/* Monthly Net Buffer */}
          <div className="bg-emerald-50/70 p-5 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-bold uppercase tracking-wider">
              <span>{t.cashBufferLabel}</span>
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="mt-2 text-3xl font-extrabold text-emerald-950 font-mono">
              ₹{finance.netCashBuffer.toLocaleString()}
            </div>
            <span className="mt-1 block text-xs text-emerald-800 font-medium">
              {isKn
                ? 'ಎಲ್ಲಾ ಖರ್ಚು ಮತ್ತು ಕಂತು ಕಟ್ಟಿದ ನಂತರ ನಿಮ್ಮ ಕೈಯಲ್ಲಿ ಉಳಿಯುವ ಹಣ'
                : 'Surplus left in hand each month after paying all costs & EMI'}
            </span>
          </div>
        </div>

        {/* Break-Even & Payback stats */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-200 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-500" />
            <span className="text-stone-600 font-medium">{t.breakEvenLabel}:</span>
            <span className="font-bold text-stone-900 font-mono">
              ~{finance.breakEvenMonths} {t.monthsUnit}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-500" />
            <span className="text-stone-600 font-medium">{t.paybackLabel}:</span>
            <span className="font-bold text-stone-900 font-mono">
              ~{finance.paybackPeriodMonths} {t.monthsUnit}
            </span>
          </div>
        </div>
      </div>

      {/* Editable Assumptions Steppers */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-700" />
              {t.editAssumptionsTitle}
            </h3>
            <p className="text-xs text-stone-500">{t.editAssumptionsNote}</p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            {isKn ? 'ತ್ವರಿತ ಮರುಲೆಕ್ಕಾಚಾರ ಸಕ್ರಿಯ' : 'Instant Recalculation Active'}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Revenue Stepper */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              {t.monthlyRevenueLabel}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustValue('monthlyRevenue', -5000, 5000)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-bold text-lg cursor-pointer"
              >
                −
              </button>
              <div className="flex-1 text-center py-2 px-3 rounded-lg border border-stone-200 bg-stone-50 font-mono font-bold text-stone-900 text-sm">
                ₹{assumptions.monthlyRevenue.toLocaleString()}
              </div>
              <button
                type="button"
                onClick={() => adjustValue('monthlyRevenue', 5000)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-bold text-lg cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Expenses Stepper */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              {t.monthlyExpensesLabel}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustValue('monthlyExpenses', -3000, 3000)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-bold text-lg cursor-pointer"
              >
                −
              </button>
              <div className="flex-1 text-center py-2 px-3 rounded-lg border border-stone-200 bg-stone-50 font-mono font-bold text-stone-900 text-sm">
                ₹{assumptions.monthlyExpenses.toLocaleString()}
              </div>
              <button
                type="button"
                onClick={() => adjustValue('monthlyExpenses', 3000)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-bold text-lg cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Loan Tenure Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              {t.loanTenureLabel}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[24, 36, 48, 60].map((tenure) => (
                <button
                  key={tenure}
                  type="button"
                  onClick={() =>
                    onUpdateAssumptions({ ...assumptions, loanTenureMonths: tenure })
                  }
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    assumptions.loanTenureMonths === tenure
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {tenure}m ({(tenure / 12).toFixed(0)}y)
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate Stepper */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              {t.interestRateLabel}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustValue('interestRate', -0.5, 5)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-bold text-lg cursor-pointer"
              >
                −
              </button>
              <div className="flex-1 text-center py-2 px-3 rounded-lg border border-stone-200 bg-stone-50 font-mono font-bold text-stone-900 text-sm">
                {assumptions.interestRate.toFixed(1)}%
              </div>
              <button
                type="button"
                onClick={() => adjustValue('interestRate', 0.5, 5)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-bold text-lg cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* What-If Stress Scenario Simulator */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-stone-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              {t.whatIfHeading}
            </h3>
            <p className="text-xs text-stone-400">{t.whatIfSubheading}</p>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-md ${
              finance.stressCase.isSolvent
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}
          >
            {finance.stressCase.isSolvent ? t.stressSolvent : t.stressInsolvent}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base Case */}
          <div className="bg-stone-800/80 rounded-xl p-4 border border-stone-700">
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              {t.baseCaseLabel}
            </span>
            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-stone-300">
                <span>Revenue:</span>
                <span>₹{finance.monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>Expenses:</span>
                <span>₹{finance.monthlyExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>EMI:</span>
                <span>₹{finance.monthlyEmi.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-stone-700 flex justify-between font-bold text-emerald-400 text-sm">
                <span>Net Buffer:</span>
                <span>₹{finance.netCashBuffer.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Stress Case */}
          <div className="bg-stone-800/80 rounded-xl p-4 border border-amber-900/60">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              {t.stressCaseLabel}
            </span>
            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-stone-300">
                <span>Revenue (-20%):</span>
                <span>₹{finance.stressCase.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>Expenses (+10%):</span>
                <span>₹{finance.stressCase.expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>EMI:</span>
                <span>₹{finance.monthlyEmi.toLocaleString()}</span>
              </div>
              <div
                className={`pt-2 border-t border-stone-700 flex justify-between font-bold text-sm ${
                  finance.stressCase.netBuffer >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                <span>Net Stress Buffer:</span>
                <span>
                  {finance.stressCase.netBuffer >= 0 ? '+' : ''}₹
                  {finance.stressCase.netBuffer.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-stone-400 leading-relaxed">
          {isKn
            ? 'ಸಲಹೆ: ವ್ಯವಹಾರದಲ್ಲಿ ಏರಿಳಿತಗಳು ಸಹಜ. ಕನಿಷ್ಠ ೨ ತಿಂಗಳ ಕೆಲಸದ ಬಂಡವಾಳವನ್ನು (Working Capital) ಬ್ಯಾಂಕಿನಲ್ಲಿ ಅಥವಾ ಕೈಯಲ್ಲಿ ಸದಾ ಉಳಿಸಿಕೊಳ್ಳಿ.'
            : 'Advisory: Business cycles experience seasonality. Always preserve at least 2 months of operational expenses as a reserve buffer before commencing.'}
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
        >
          <span>{t.financeNextCta}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
