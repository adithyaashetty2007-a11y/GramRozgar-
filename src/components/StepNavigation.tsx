import React from 'react';
import { Language } from '../types';
import { T } from '../services/translations';
import { Lightbulb, Store, Calculator, Award, AlertTriangle, ListChecks, FileText, Check } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  language: Language;
  hasAnalysis: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  onStepClick,
  language,
  hasAnalysis,
}) => {
  const t = T[language];

  const steps = [
    { number: 1, label: t.navIdea, icon: Lightbulb },
    { number: 2, label: t.navMarket, icon: Store },
    { number: 3, label: t.navFinance, icon: Calculator },
    { number: 4, label: t.navSchemes, icon: Award },
    { number: 5, label: t.navRisks, icon: AlertTriangle },
    { number: 6, label: t.navNextSteps, icon: ListChecks },
    { number: 7, label: t.navReport, icon: FileText },
  ];

  return (
    <div className="bg-white border-b border-stone-200 py-3 px-4 shadow-2xs overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[720px] gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isClickable = step.number === 1 || hasAnalysis;

          return (
            <button
              key={step.number}
              disabled={!isClickable}
              onClick={() => onStepClick(step.number)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : isCompleted
                  ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  isActive
                    ? 'bg-white text-emerald-900'
                    : isCompleted
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3" /> : step.number}
              </span>
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
