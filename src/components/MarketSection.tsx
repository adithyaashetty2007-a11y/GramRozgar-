import React, { useState } from 'react';
import { Language, MarketAnalysisResult } from '../types';
import { T } from '../services/translations';
import {
  Users,
  Home,
  Store,
  TrendingUp,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';

interface MarketSectionProps {
  market: MarketAnalysisResult;
  language: Language;
  onNext: () => void;
  aiExplanation?: string;
  isLoadingAi?: boolean;
}

export const MarketSection: React.FC<MarketSectionProps> = ({
  market,
  language,
  onNext,
  aiExplanation,
  isLoadingAi,
}) => {
  const t = T[language];
  const isKn = language === 'kn';

  // Text-To-Speech audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);

  const handleToggleVoice = async () => {
    // If audio is currently playing, stop it
    if (isPlayingAudio) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak =
      aiExplanation ||
      (isKn ? market.rationaleKn.join('. ') : market.rationaleEn.join('. '));

    setIsPlayingAudio(true);

    // Tier 1: Try High-Fidelity Server-Side Gemini TTS (Supports Indian languages cleanly)
    try {
      const res = await fetch('/api/advisor/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audioPlayerRef.current = audio;
          audio.onended = () => setIsPlayingAudio(false);
          audio.onerror = () => setIsPlayingAudio(false);
          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn('Server TTS failed, falling back to Web Speech API:', err);
    }

    // Tier 2: Browser Web Speech Synthesis Fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = isKn ? 'kn-IN' : 'en-IN';
      utterance.rate = 0.95;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-800 bg-emerald-50 border-emerald-300';
    if (score >= 45) return 'text-amber-800 bg-amber-50 border-amber-300';
    return 'text-rose-800 bg-rose-50 border-rose-300';
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            {market.locationName} · {t.demoModeBadge}
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
            {t.marketHeading}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-600">
            {t.marketSubheading}
          </p>
        </div>

        {/* Data Confidence Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span className="text-xs text-stone-600 font-medium">
            {t.confidenceLabel}:
          </span>
          <span className="text-xs font-bold text-emerald-800">
            {market.confidence}
          </span>
        </div>
      </div>

      {/* 3 Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Demand Score */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t.demandScoreLabel}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-stone-900 font-mono">
              {market.demandScore}
            </span>
            <span className="text-sm font-semibold text-stone-400">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-700 h-2 rounded-full transition-all duration-500"
              style={{ width: `${market.demandScore}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-stone-600">
            {isKn
              ? 'ಗ್ರಾಮದ ಕುಟುಂಬಗಳ ಸಂಖ್ಯೆ ಮತ್ತು ಅಗತ್ಯತೆಯ ಆಧಾರದ ಮೇಲೆ'
              : 'Based on village household density & daily purchasing needs'}
          </p>
        </div>

        {/* Competition Score */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t.competitionScoreLabel}
            </span>
            <Store className="w-4 h-4 text-amber-700" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-stone-900 font-mono">
              {market.competitionScore}
            </span>
            <span className="text-sm font-semibold text-stone-400">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                market.competitionScore > 65 ? 'bg-amber-600' : 'bg-emerald-600'
              }`}
              style={{ width: `${market.competitionScore}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-stone-600">
            {isKn
              ? `ಈ ಪಂಚಾಯತ್‌ನಲ್ಲಿ ಪ್ರಸ್ತುತ ${market.existingBusinessesCount} ಸಕ್ರಿಯ ಘಟಕಗಳಿವೆ`
              : `${market.existingBusinessesCount} active existing units recorded in this Panchayat`}
          </p>
        </div>

        {/* Market Potential */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t.marketPotentialLabel}
            </span>
            <Sparkles className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-emerald-900 font-mono">
              {market.marketPotential}
            </span>
            <span className="text-sm font-semibold text-stone-400">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-800 h-2 rounded-full transition-all duration-500"
              style={{ width: `${market.marketPotential}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-stone-600">
            {isKn
              ? 'ಬೇಡಿಕೆ ಮತ್ತು ಸ್ಪರ್ಧೆಯ ಸಮತೋಲನದ ಗಣಿತೀಯ ಫಲಿತಾಂಶ'
              : 'Mathematical synthesis of market room and consumer demand'}
          </p>
        </div>
      </div>

      {/* Panchayat Baseline Data Table */}
      <div className="bg-stone-50 rounded-xl border border-stone-200 p-5">
        <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-700" />
          {isKn ? 'ಸ್ಥಳೀಯ ಪಂಚಾಯತ್ ಅಂಕಿಅಂಶಗಳು' : 'Local Panchayat Baseline Data'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-white rounded-lg border border-stone-200">
            <span className="block text-[11px] text-stone-500 font-medium">
              {t.householdsLabel}
            </span>
            <span className="text-lg font-bold text-stone-900 font-mono">
              {market.households.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-white rounded-lg border border-stone-200">
            <span className="block text-[11px] text-stone-500 font-medium">
              {t.populationLabel}
            </span>
            <span className="text-lg font-bold text-stone-900 font-mono">
              {market.population.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-white rounded-lg border border-stone-200">
            <span className="block text-[11px] text-stone-500 font-medium">
              {t.existingUnitsLabel}
            </span>
            <span className="text-lg font-bold text-stone-900 font-mono">
              {market.existingBusinessesCount}
            </span>
          </div>
          <div className="p-3 bg-white rounded-lg border border-stone-200">
            <span className="block text-[11px] text-stone-500 font-medium">
              {isKn ? 'ದತ್ತಾಂಶದ ಮೂಲ' : 'Dataset Source'}
            </span>
            <span className="text-xs font-bold text-emerald-800">
              GramRozgar Curated
            </span>
          </div>
        </div>
      </div>

      {/* Rationale & AI Explanation Card */}
      <div className="bg-white rounded-xl border border-emerald-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-stone-900">
              {t.explainMarketWithAi}
            </h3>
          </div>

          {/* Listen Voice Button */}
          <button
            onClick={handleToggleVoice}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-300'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>{t.stopVoice}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>🔊 {t.listenVoice}</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {isLoadingAi ? (
            <div className="flex items-center gap-3 py-4 text-stone-500 text-xs">
              <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
              <span>
                {isKn
                  ? 'ಎಐ ವಿಶ್ಲೇಷಣೆ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...'
                  : 'Preparing AI conversational explanation...'}
              </span>
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-2">
              {(isKn ? market.rationaleKn : market.rationaleEn).map((point, idx) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold shrink-0">·</span>
                  <span>{point}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary Bottom Action */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
        >
          <span>{t.marketNextCta}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
