import React from 'react';
import { Language } from '../types';
import { T } from '../services/translations';
import { Globe, BookmarkCheck, ShieldCheck, RotateCcw } from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenAdmin: () => void;
  onResetDemo: () => void;
  currentStep: number;
  onNavigateStep: (step: number) => void;
  hasAnalysis: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  savedCount,
  onOpenSaved,
  onOpenAdmin,
  onResetDemo,
  currentStep,
  onNavigateStep,
  hasAnalysis,
}) => {
  const t = T[language];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single Brand Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateStep(1)}
            className="text-left group cursor-pointer focus:outline-hidden"
          >
            <span className="text-xl font-extrabold tracking-tight text-emerald-950 font-serif">
              {t.brandName}
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium text-emerald-700">
              {language === 'kn' ? 'ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗದರ್ಶಿ' : 'Rural Advisory'}
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-stone-600">
          <button
            onClick={() => onNavigateStep(1)}
            className={`transition-colors hover:text-emerald-800 ${
              currentStep === 1 ? 'text-emerald-900 border-b-2 border-emerald-800 pb-0.5' : ''
            }`}
          >
            {t.navIdea}
          </button>
          {hasAnalysis && (
            <>
              <button
                onClick={() => onNavigateStep(2)}
                className={`transition-colors hover:text-emerald-800 ${
                  currentStep === 2 ? 'text-emerald-900 border-b-2 border-emerald-800 pb-0.5' : ''
                }`}
              >
                {t.navMarket}
              </button>
              <button
                onClick={() => onNavigateStep(3)}
                className={`transition-colors hover:text-emerald-800 ${
                  currentStep === 3 ? 'text-emerald-900 border-b-2 border-emerald-800 pb-0.5' : ''
                }`}
              >
                {t.navFinance}
              </button>
              <button
                onClick={() => onNavigateStep(4)}
                className={`transition-colors hover:text-emerald-800 ${
                  currentStep === 4 ? 'text-emerald-900 border-b-2 border-emerald-800 pb-0.5' : ''
                }`}
              >
                {t.navSchemes}
              </button>
              <button
                onClick={() => onNavigateStep(5)}
                className={`transition-colors hover:text-emerald-800 ${
                  currentStep === 5 ? 'text-emerald-900 border-b-2 border-emerald-800 pb-0.5' : ''
                }`}
              >
                {t.navRisks}
              </button>
              <button
                onClick={() => onNavigateStep(7)}
                className={`transition-colors hover:text-emerald-800 ${
                  currentStep === 7 ? 'text-emerald-900 border-b-2 border-emerald-800 pb-0.5' : ''
                }`}
              >
                {t.navReport}
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'kn' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs font-bold text-stone-800 transition-colors shadow-2xs"
            title="Switch Language / ಭಾಷೆ ಬದಲಾಯಿಸಿ"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span className="tracking-wide">
              {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
            </span>
          </button>

          {/* Saved Businesses */}
          <button
            onClick={onOpenSaved}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs font-medium text-stone-700 transition-colors shadow-2xs"
            title={t.savedBusinesses}
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">{t.savedBusinesses}</span>
            {savedCount > 0 && (
              <span className="bg-emerald-700 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={onResetDemo}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
            title="Reset Demo / ಮರುಹೊಂದಿಸಿ"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Admin Link */}
          <button
            onClick={onOpenAdmin}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
            title="Admin Portal"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
