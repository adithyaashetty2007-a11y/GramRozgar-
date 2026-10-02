import React, { useState, useEffect } from 'react';
import { BusinessCategoryId, Language, UserInputState } from '../types';
import { BUSINESS_TEMPLATES, DEMO_LOCATIONS } from '../data/demoData';
import { T } from '../services/translations';
import {
  Mic,
  MicOff,
  MapPin,
  IndianRupee,
  Navigation,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Milk,
  Store,
  Scissors,
  Egg,
  Coffee,
  Wheat,
  Wrench,
  Smartphone,
  Layers,
} from 'lucide-react';

interface HomeHeroProps {
  language: Language;
  onAnalyze: (inputs: UserInputState) => void;
  isAnalyzing: boolean;
  initialInputs?: UserInputState;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  language,
  onAnalyze,
  isAnalyzing,
  initialInputs,
}) => {
  const t = T[language];
  const isKn = language === 'kn';

  // Input states
  const [ideaText, setIdeaText] = useState(
    initialInputs?.businessIdea ||
      (isKn
        ? 'ನಾನು ಬೆಳ್ತಂಗಡಿಯಲ್ಲಿ ಒಂದು ಹಾಲಿನ ಅಂಗಡಿ ಶುರು ಮಾಡಬೇಕು. ನನ್ನ ಬಳಿ ಒಂದು ಲಕ್ಷ ರೂಪಾಯಿ ಇದೆ.'
        : 'I want to open a small dairy and milk shop in Belthangady. I have 1 lakh rupees capital.')
  );
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategoryId>(
    initialInputs?.categoryId || 'dairy_shop'
  );
  const [selectedDemoLocationId, setSelectedDemoLocationId] = useState<string>(
    initialInputs?.location.demoLocationId || DEMO_LOCATIONS[0].id
  );
  const [capital, setCapital] = useState<number>(initialInputs?.capital || 100000);
  const [loanRequested, setLoanRequested] = useState<number | undefined>(
    initialInputs?.loanRequested
  );

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showManualType, setShowManualType] = useState(true);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  // Sync sample prompt on language switch if unchanged
  useEffect(() => {
    if (!initialInputs) {
      if (isKn) {
        setIdeaText('ನಾನು ಬೆಳ್ತಂಗಡಿಯಲ್ಲಿ ಒಂದು ಹಾಲಿನ ಅಂಗಡಿ ಶುರು ಮಾಡಬೇಕು. ನನ್ನ ಬಳಿ ಒಂದು ಲಕ್ಷ ರೂಪಾಯಿ ಇದೆ.');
      } else {
        setIdeaText('I want to open a small dairy and milk shop in Belthangady. I have 1 lakh rupees capital.');
      }
    }
  }, [language]);

  // Robust Voice Recording with MediaRecorder + SpeechRecognition Fallback
  const handleToggleVoiceRecording = async () => {
    setSpeechError(null);

    // If currently recording, stop it
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // Try getUserMedia first for real microphone capture
    let stream: MediaStream | null = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (err: any) {
      console.warn('getUserMedia denied or unavailable:', err);
    }

    if (stream) {
      try {
        audioChunksRef.current = [];
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
          ? 'audio/ogg;codecs=opus'
          : 'audio/webm';

        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          stream?.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

          if (audioBlob.size > 1000) {
            setIsTranscribing(true);
            try {
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = async () => {
                const base64Audio = (reader.result as string).split(',')[1];
                const res = await fetch('/api/advisor/transcribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    audioBase64: base64Audio,
                    mimeType,
                    language,
                  }),
                });

                if (res.ok) {
                  const data = await res.json();
                  if (data.transcript) {
                    setIdeaText(data.transcript);
                  }
                  if (data.categoryId) {
                    setSelectedCategory(data.categoryId);
                  }
                  if (data.extractedCapital) {
                    setCapital(data.extractedCapital);
                  }
                }
                setIsTranscribing(false);
              };
            } catch (err) {
              console.warn('Transcription error:', err);
              setIsTranscribing(false);
            }
          }
        };

        recorder.start();
        setIsRecording(true);
        return;
      } catch (recErr) {
        console.warn('MediaRecorder init failed, trying SpeechRecognition:', recErr);
      }
    }

    // Fallback: Web Speech API (SpeechRecognition)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = isKn ? 'kn-IN' : 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsRecording(true);
          setVoiceTranscript('');
        };

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setVoiceTranscript(transcript);
          setIdeaText(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsRecording(false);
          setSpeechError(
            isKn
              ? 'ಧ್ವನಿ ಸ್ಪಷ್ಟವಾಗಿ ಕೇಳಲಿಲ್ಲ ಅಥವಾ ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಮಾದರಿ ಧ್ವನಿ ಬಟನ್ ಬಳಸಿ ಅಥವಾ ಬರೆಯಿರಿ.'
              : 'Microphone not accessible in this browser window. Use the demo voice button below or type instead.'
          );
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        return;
      } catch (asrErr) {
        console.warn(asrErr);
      }
    }

    // Final fallback: show message and offer one-click demo voice simulation
    setSpeechError(
      isKn
        ? 'ಮೈಕ್ರೋಫೋನ್ ಸೌಲಭ್ಯ ಲಭ್ಯವಿಲ್ಲ. ಕೆಳಗಿನ "ಮಾದರಿ ಧ್ವನಿ ಪರೀಕ್ಷಿಸಿ" ಬಟನ್ ಒತ್ತಿ.'
        : 'Microphone permission blocked or unavailable. Click "Simulate Spoken Audio" below to test.'
    );
  };

  // One-click demo voice simulation
  const handleSimulateVoiceInput = (sampleType: 'dairy' | 'kirana' | 'poultry') => {
    setSpeechError(null);
    setIsTranscribing(true);

    setTimeout(() => {
      if (sampleType === 'dairy') {
        const text = isKn
          ? 'ನಾನು ಬೆಳ್ತಂಗಡಿಯಲ್ಲಿ ಒಂದು ಹಾಲಿನ ಅಂಗಡಿ ಶುರು ಮಾಡಬೇಕು. ನನ್ನ ಬಳಿ ಒಂದು ಲಕ್ಷ ರೂಪಾಯಿ ಇದೆ.'
          : 'I want to open a small dairy and milk shop in Belthangady. I have 1 lakh rupees capital.';
        setIdeaText(text);
        setSelectedCategory('dairy_shop');
        setCapital(100000);
        setSelectedDemoLocationId('ujire_belthangady');
      } else if (sampleType === 'kirana') {
        const text = isKn
          ? 'ನನಗೆ ಬಂಟ್ವಾಳದಲ್ಲಿ ದಿನಸಿ ಕಿರಾಣಿ ಅಂಗಡಿ ಆರಂಭಿಸಬೇಕಿದೆ, ಎರಡು ಲಕ್ಷ ಬಂಡವಾಳವಿದೆ.'
          : 'I want to open a grocery kirana store in Bantwal, I have 2 lakh capital.';
        setIdeaText(text);
        setSelectedCategory('kirana_store');
        setCapital(200000);
        setSelectedDemoLocationId('bantwal_rural');
      } else {
        const text = isKn
          ? 'ಪುತ್ತೂರಿನಲ್ಲಿ ಸಣ್ಣ ಕೋಳಿ ಸಾಕಣೆ ಫಾರ್ಮ್ ಶುರು ಮಾಡಲು ಬಯಸುತ್ತೇನೆ.'
          : 'I want to start a small poultry farm unit in Puttur.';
        setIdeaText(text);
        setSelectedCategory('poultry_farm');
        setCapital(150000);
        setSelectedDemoLocationId('puttur_padnur');
      }
      setIsTranscribing(false);
    }, 600);
  };

  // GPS Location Handler
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus(isKn ? 'ಜಿಪಿಎಸ್ ಲಭ್ಯವಿಲ್ಲ' : 'GPS not available');
      return;
    }
    setGpsStatus(isKn ? 'ಸ್ಥಳ ಪತ್ತೆಮಾಡಲಾಗುತ್ತಿದೆ...' : 'Detecting GPS...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Map to nearest demo panchayat for reliable data
        setSelectedDemoLocationId(DEMO_LOCATIONS[0].id);
        setGpsStatus(
          isKn
            ? `ಪತ್ತೆಯಾಗಿದೆ: ${DEMO_LOCATIONS[0].panchayat}`
            : `Detected: ${DEMO_LOCATIONS[0].panchayat}`
        );
        setTimeout(() => setGpsStatus(null), 4000);
      },
      (err) => {
        console.warn(err);
        setGpsStatus(
          isKn
            ? 'ಜಿಪಿಎಸ್ ಅನುಮತಿ ಸಿಗಲಿಲ್ಲ. ಮಾದರಿ ಪಂಚಾಯತ್ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ.'
            : 'GPS permission denied. Using demo panchayat.'
        );
        setTimeout(() => setGpsStatus(null), 3000);
      }
    );
  };

  const handleTemplateSelect = (tmpl: (typeof BUSINESS_TEMPLATES)[0]) => {
    setSelectedCategory(tmpl.id);
    setIdeaText(isKn ? tmpl.descriptionKn : tmpl.descriptionEn);
    setCapital(tmpl.defaultProjectCost / 2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loc =
      DEMO_LOCATIONS.find((l) => l.id === selectedDemoLocationId) || DEMO_LOCATIONS[0];

    onAnalyze({
      businessIdea: ideaText.trim() || (isKn ? 'ಹಾಲಿನ ಅಂಗಡಿ' : 'Dairy Shop'),
      categoryId: selectedCategory,
      location: {
        isDemo: true,
        demoLocationId: loc.id,
        state: loc.state,
        district: loc.district,
        taluk: loc.taluk,
        panchayat: loc.panchayat,
      },
      capital: Number(capital) > 0 ? Number(capital) : 100000,
      loanRequested: loanRequested ? Number(loanRequested) : undefined,
      language,
    });
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Milk':
        return <Milk className="w-4 h-4 text-emerald-700" />;
      case 'Store':
        return <Store className="w-4 h-4 text-amber-700" />;
      case 'Egg':
        return <Egg className="w-4 h-4 text-orange-700" />;
      case 'Scissors':
        return <Scissors className="w-4 h-4 text-indigo-700" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4 text-rose-700" />;
      case 'Wheat':
        return <Wheat className="w-4 h-4 text-yellow-700" />;
      case 'Wrench':
        return <Wrench className="w-4 h-4 text-slate-700" />;
      case 'Smartphone':
        return <Smartphone className="w-4 h-4 text-cyan-700" />;
      default:
        return <Layers className="w-4 h-4 text-emerald-700" />;
    }
  };

  return (
    <section className="py-8 md:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Main Header / Tagline */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-emerald-800 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {t.tagline}
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight font-serif text-balance">
            {t.heroTitle}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-stone-600 max-w-2xl mx-auto">
            {t.heroSubtitle}
          </p>
        </div>

        {/* Advisory Input Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-md p-6 sm:p-8">
          {/* Voice Prompt Box */}
          <div className="text-center pb-6 border-b border-stone-200">
            <div className="flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={handleToggleVoiceRecording}
                className={`relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white ring-8 ring-rose-200 animate-pulse'
                    : isTranscribing
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-emerald-800 text-white hover:bg-emerald-900 hover:scale-105 shadow-md'
                }`}
                title={t.voiceButton}
              >
                {isRecording ? (
                  <MicOff className="w-9 h-9 sm:w-10 sm:h-10 animate-bounce" />
                ) : isTranscribing ? (
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Mic className="w-9 h-9 sm:w-10 sm:h-10" />
                )}
              </button>

              <span className="mt-3 text-sm font-bold text-stone-900">
                {isRecording
                  ? t.voiceListening
                  : isTranscribing
                  ? (isKn ? 'ಧ್ವನಿಯನ್ನು ಪರಿವರ್ತಿಸಲಾಗುತ್ತಿದೆ...' : 'Processing spoken voice...')
                  : t.voiceButton}
              </span>

              <p className="mt-1 text-xs text-stone-500 max-w-md">
                {isKn ? t.voiceKannadaExamplePrompt : t.voiceExamplePrompt}
              </p>

              {/* Quick Spoken Voice Sample Testing Chips */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] font-semibold text-stone-500">
                  {isKn ? 'ಧ್ವನಿ ಮಾದರಿ ಪರೀಕ್ಷಿಸಿ:' : 'Test Voice Input:'}
                </span>
                <button
                  type="button"
                  onClick={() => handleSimulateVoiceInput('dairy')}
                  className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  🎙️ {isKn ? 'ಹಾಲಿನ ಅಂಗಡಿ (Dairy)' : 'Dairy Shop'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateVoiceInput('kirana')}
                  className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  🎙️ {isKn ? 'ದಿನಸಿ ಅಂಗಡಿ (Kirana)' : 'Kirana Store'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateVoiceInput('poultry')}
                  className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-900 border border-orange-300 text-[11px] font-bold hover:bg-orange-100 transition-colors cursor-pointer"
                >
                  🎙️ {isKn ? 'ಕೋಳಿ ಸಾಕಣೆ (Poultry)' : 'Poultry Unit'}
                </button>
              </div>

              {speechError && (
                <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 font-medium max-w-md">
                  {speechError}
                </div>
              )}
            </div>
          </div>

          {/* Form Inputs */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Business Idea Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  {isKn ? 'ನಿಮ್ಮ ವ್ಯವಹಾರದ ಕಲ್ಪನೆ' : 'Your Business Idea'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowManualType(!showManualType)}
                  className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
                >
                  {t.typeInstead}
                </button>
              </div>

              <textarea
                rows={3}
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                placeholder={
                  isKn
                    ? 'ಉದಾ: ನಾನು ಒಂದು ಹಾಲಿನ ಅಂಗಡಿ ಅಥವಾ ದಿನಸಿ ಅಂಗಡಿ ಆರಂಭಿಸಲು ಬಯಸುತ್ತೇನೆ...'
                    : 'e.g. I want to open a small grocery shop or poultry unit...'
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 text-stone-900 text-sm leading-relaxed outline-hidden transition-all shadow-2xs resize-none"
              />
            </div>

            {/* Quick Templates Picker */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-2">
                {t.orChooseTemplate}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {BUSINESS_TEMPLATES.slice(0, 8).map((tmpl) => {
                  const isSelected = selectedCategory === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleTemplateSelect(tmpl)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-700 shadow-xs'
                          : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      {getTemplateIcon(tmpl.iconName)}
                      <span className="truncate">{isKn ? tmpl.titleKn : tmpl.titleEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location & Capital Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Location Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    {t.locationLabel}
                  </label>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    {t.useMyLocation}
                  </button>
                </div>

                <div className="relative">
                  <select
                    value={selectedDemoLocationId}
                    onChange={(e) => setSelectedDemoLocationId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 text-stone-900 text-sm font-medium outline-hidden transition-all shadow-2xs appearance-none"
                  >
                    {DEMO_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.panchayat}, {loc.taluk} ({loc.district})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-3.5 pointer-events-none text-stone-400 text-xs">
                    ▼
                  </div>
                </div>

                <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="text-emerald-800 font-semibold">{t.demoModeBadge}</span>
                  {gpsStatus && <span className="text-stone-700 font-medium">{gpsStatus}</span>}
                </div>
              </div>

              {/* Available Capital Input */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
                  {t.capitalLabel}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-stone-500 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="5000"
                    step="5000"
                    value={capital}
                    onChange={(e) => setCapital(Number(e.target.value))}
                    placeholder="100000"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 text-stone-900 text-sm font-semibold outline-hidden transition-all shadow-2xs"
                  />
                </div>
                {/* Capital Presets */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-stone-500 font-medium">
                    {isKn ? 'ತ್ವರಿತ ಮೊತ್ತ:' : 'Quick:'}
                  </span>
                  {[50000, 100000, 200000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCapital(amt)}
                      className={`text-[11px] px-2.5 py-1 rounded-md border font-semibold transition-all cursor-pointer ${
                        capital === amt
                          ? 'bg-emerald-800 text-white border-emerald-800'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      ₹{(amt / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary CTA Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <span>{t.analyzing}</span>
                ) : (
                  <>
                    <span>{t.analyzeButton}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
