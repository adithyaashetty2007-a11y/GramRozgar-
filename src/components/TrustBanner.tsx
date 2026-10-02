import React from 'react';
import { Language } from '../types';
import { T } from '../services/translations';
import { Sparkles, Shield, Cpu, Database } from 'lucide-react';

interface TrustBannerProps {
  language: Language;
}

export const TrustBanner: React.FC<TrustBannerProps> = ({ language }) => {
  const isKn = language === 'kn';

  return (
    <div className="bg-emerald-900 text-emerald-50 py-2.5 px-4 text-xs border-b border-emerald-950">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-emerald-200 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-300" />
            {isKn ? 'ವಿಶ್ವಾಸದ ತತ್ವ' : 'Core Trust Principle'}
          </span>
          <span className="text-emerald-100 hidden sm:inline">
            {isKn
              ? 'ದತ್ತಾಂಶ ಸಾಕ್ಷ್ಯ ನೀಡುತ್ತದೆ · ಕೋಡ್ ಲೆಕ್ಕಾಚಾರ ಮಾಡುತ್ತದೆ · ಎಐ ವಿವರಣೆ ನೀಡುತ್ತದೆ'
              : 'Data provides the evidence · Code performs calculations · AI explains the results'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-emerald-200">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-emerald-300" />
            {isKn ? 'ಪಂಚಾಯತ್ ದತ್ತಾಂಶ' : 'Curated Panchayats'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-emerald-300" />
            {isKn ? 'ನಿಖರ ಹಣಕಾಸು ಸೂತ್ರ' : 'Deterministic Math'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            {isKn ? 'ಸುಲಭ ಕನ್ನಡ/ಇಂಗ್ಲಿಷ್ ಎಐ' : 'Adaptive AI'}
          </span>
        </div>
      </div>
    </div>
  );
};
