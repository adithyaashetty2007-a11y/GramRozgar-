import React, { useState } from 'react';
import { GovScheme, Language } from '../types';
import { T } from '../services/translations';
import {
  Award,
  ExternalLink,
  FileCheck,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Percent,
} from 'lucide-react';

interface SchemesSectionProps {
  schemes: GovScheme[];
  language: Language;
  onNext: () => void;
}

export const SchemesSection: React.FC<SchemesSectionProps> = ({
  schemes,
  language,
  onNext,
}) => {
  const t = T[language];
  const isKn = language === 'kn';

  // Toggle expanded scheme cards
  const [expandedId, setExpandedId] = useState<string>(
    schemes.length > 0 ? schemes[0].id : ''
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            {t.demoModeBadge}
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
            {t.schemesHeading}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-600">
            {t.schemesSubheading}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
          <Calendar className="w-3.5 h-3.5 text-emerald-700" />
          <span>{isKn ? 'ಪರಿಶೀಲಿಸಿದ ಯೋಜನೆಗಳು' : 'Curated Verified Schemes'}</span>
        </div>
      </div>

      {/* Schemes List */}
      <div className="space-y-4">
        {schemes.map((scheme) => {
          const isExpanded = expandedId === scheme.id;
          const hasSubsidy = (scheme.subsidyPercentage || 0) > 0;

          return (
            <div
              key={scheme.id}
              className={`bg-white rounded-2xl border transition-all ${
                isExpanded
                  ? 'border-emerald-600 shadow-sm ring-1 ring-emerald-600'
                  : 'border-stone-200 hover:border-stone-300 shadow-2xs'
              }`}
            >
              {/* Header Card / Accordion Trigger */}
              <div
                onClick={() => setExpandedId(isExpanded ? '' : scheme.id)}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-5 h-5 text-emerald-800" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-stone-900">
                        {isKn ? scheme.nameKn : scheme.schemeName}
                      </h3>
                      {hasSubsidy && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-md border border-emerald-300">
                          {scheme.subsidyPercentage}% {t.subsidyLabel}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-stone-600 line-clamp-2">
                      {isKn ? scheme.purposeKn : scheme.purposeEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-xs font-bold text-emerald-800 hidden sm:inline">
                    {isExpanded ? (isKn ? 'ಮುಚ್ಚಿ' : 'Hide Details') : (isKn ? 'ವಿವರ ನೋಡಿ' : 'View Details')}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-stone-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-500" />
                  )}
                </div>
              </div>

              {/* Expanded Details Body */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-stone-100 space-y-5 text-xs sm:text-sm">
                  {/* Financial Assistance / Subsidy Info */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950">
                    <span className="block font-bold text-xs uppercase tracking-wider text-emerald-900 mb-1">
                      {isKn ? 'ಹಣಕಾಸು ನೆರವು ಮತ್ತು ಸಬ್ಸಿಡಿ' : 'Financial Assistance & Benefit'}
                    </span>
                    <p className="leading-relaxed">
                      {isKn ? scheme.assistanceKn : scheme.assistanceEn}
                    </p>
                  </div>

                  {/* Two column layout: Eligibility & Documents */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Eligibility */}
                    <div>
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        {t.eligibilityTitle}
                      </h4>
                      <ul className="space-y-2 text-stone-700 text-xs">
                        {(isKn ? scheme.eligibilityKn : scheme.eligibilityEn).map(
                          (item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-700 font-bold shrink-0">✓</span>
                              <span>{item}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {/* Required Documents */}
                    <div>
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-700" />
                        {t.documentsRequired}
                      </h4>
                      <ul className="space-y-2 text-stone-700 text-xs">
                        {(isKn ? scheme.documentsKn : scheme.documentsEn).map(
                          (doc, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-stone-400 font-mono text-[10px] shrink-0 mt-0.5">
                                [{idx + 1}]
                              </span>
                              <span>{doc}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Official Source & Verification Footer */}
                  <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <a
                      href={scheme.officialSource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold hover:underline"
                    >
                      <span>{t.officialPortal}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <span className="text-stone-400">
                      {t.lastVerifiedDate} {scheme.lastVerified}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
        >
          <span>{t.schemesNextCta}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
