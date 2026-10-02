import React from 'react';
import { Language, RiskAnalysisResult } from '../types';
import { T } from '../services/translations';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ClipboardList,
  Sparkles,
} from 'lucide-react';

interface RiskSectionProps {
  risks: RiskAnalysisResult;
  language: Language;
  onNext: () => void;
}

export const RiskSection: React.FC<RiskSectionProps> = ({
  risks,
  language,
  onNext,
}) => {
  const t = T[language];
  const isKn = language === 'kn';

  const getOverallBadge = () => {
    switch (risks.overallRiskLevel) {
      case 'Low':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            {isKn ? 'ಕಡಿಮೆ ಅಪಾಯ (Low Risk)' : 'Low Risk Profile'}
          </span>
        );
      case 'Medium':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            {isKn ? 'ಮಧ್ಯಮ ಅಪಾಯ (Medium Risk)' : 'Moderate Risk Profile'}
          </span>
        );
      case 'High':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-700" />
            {isKn ? 'ಹೆಚ್ಚಿನ ಅಪಾಯ (High Risk)' : 'High Risk - Exercise Caution'}
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
            {t.risksHeading}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-600">
            {t.risksSubheading}
          </p>
        </div>

        <div>{getOverallBadge()}</div>
      </div>

      {/* Positive Business Strengths */}
      {risks.positiveIndicators.length > 0 && (
        <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-6">
          <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            {t.positiveStrengths}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {risks.positiveIndicators.map((pos, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-emerald-200/80 text-xs sm:text-sm text-emerald-950 font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{isKn ? pos.titleKn : pos.titleEn}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Identified Critical Risks & Mitigations */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs">
        <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          {t.criticalRisks}
        </h3>

        {risks.risks.length === 0 ? (
          <div className="p-4 rounded-xl bg-stone-50 text-stone-600 text-xs">
            {isKn
              ? 'ಯಾವುದೇ ಗಂಭೀರ ಹಣಕಾಸು ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಅಪಾಯಗಳು ಕಂಡುಬಂದಿಲ್ಲ.'
              : 'No major structural financial or market risks identified for this configuration.'}
          </div>
        ) : (
          <div className="space-y-4">
            {risks.risks.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2 text-xs sm:text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 font-bold text-stone-900">
                    <span className="text-rose-600 shrink-0 mt-0.5">⚠️</span>
                    <span>{isKn ? item.titleKn : item.titleEn}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm shrink-0 ${
                      item.severity === 'high'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>
                <div className="pl-5 text-stone-700">
                  <span className="font-semibold text-emerald-900">
                    {isKn ? 'ಶಿಫಾರಸು ಮಾಡಿದ ಪರಿಹಾರ:' : 'Recommended Mitigation:'}{' '}
                  </span>
                  <span>{isKn ? item.mitigationKn : item.mitigationEn}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ground Verification Checklist */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6">
        <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-emerald-700" />
          {t.thingsToVerify}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-stone-700">
          {(isKn ? risks.thingsToVerifyKn : risks.thingsToVerifyEn).map((check, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-stone-200"
            >
              <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{check}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
        >
          <span>{t.risksNextCta}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
