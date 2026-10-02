import React, { useState } from 'react';
import { Language } from '../types';
import { T } from '../services/translations';
import {
  ListChecks,
  CheckCircle2,
  Circle,
  ArrowRight,
  FileText,
  Building,
  Users,
  Store,
  FileCheck,
} from 'lucide-react';

interface NextStepsSectionProps {
  language: Language;
  onNext: () => void;
  categoryTitle: string;
}

export const NextStepsSection: React.FC<NextStepsSectionProps> = ({
  language,
  onNext,
  categoryTitle,
}) => {
  const t = T[language];
  const isKn = language === 'kn';

  const defaultSteps = [
    {
      id: 1,
      titleEn: 'Ground Demand Survey with Village Families',
      titleKn: 'ಗ್ರಾಮದ ಕುಟುಂಬಗಳೊಂದಿಗೆ ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆ ಸಮೀಕ್ಷೆ',
      descEn:
        'Visit at least 15-20 regular village households and local shopkeepers. Verify their daily requirements, preferred timing, and prices paid.',
      descKn:
        'ಗ್ರಾಮದ ೧೫-೨೦ ಕುಟುಂಬಗಳನ್ನು ಮತ್ತು ಸ್ಥಳೀಯ ಅಂಗಡಿಕಾರರನ್ನು ಭೇಟಿ ಮಾಡಿ. ಅವರ ನಿತ್ಯದ ಅಗತ್ಯ, ಬೆಲೆ ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ನೇರವಾಗಿ ತಿಳಿಯಿರಿ.',
      icon: Users,
    },
    {
      id: 2,
      titleEn: 'Premises Lease Agreement & Electrical Sanction',
      titleKn: 'ಅಂಗಡಿ ಜಾಗದ ಲಿಖಿತ ಬಾಡಿಗೆ ಕರಾರು ಮತ್ತು ವಿದ್ಯುತ್ ಸಂಪರ್ಕ',
      descEn:
        'Finalize a written lease agreement with shop owner for minimum 3 years. Check that adequate power (single phase or 3-phase) is officially metered.',
      descKn:
        'ಕನಿಷ್ಠ ೩ ವರ್ಷಗಳ ಲಿಖಿತ ಬಾಡಿಗೆ ಒಪ್ಪಂದ ಮಾಡಿಕೊಳ್ಳಿ. ಯಂತ್ರೋಪಕರಣಗಳಿಗೆ ಬೇಕಾದ ವಿದ್ಯುತ್ ಮೀಟರ್ ಸಂಪರ್ಕ ಸರಿ ಇದೆಯೇ ಪರೀಕ್ಷಿಸಿ.',
      icon: Store,
    },
    {
      id: 3,
      titleEn: 'Gram Panchayat Trade License / NOC Guidelines',
      titleKn: 'ಗ್ರಾಮ ಪಂಚಾಯತ್ ವ್ಯಾಪಾರ ಪರವಾನಗಿ / ನಿರಾಕ್ಷೇಪಣಾ ಪತ್ರ',
      descEn:
        'Inquire with the Panchayat Development Officer (PDO) regarding rural trade license or FSSAI registration requirements for food & retail.',
      descKn:
        'ಗ್ರಾಮ ಪಂಚಾಯತ್ ಅಭಿವೃದ್ಧಿ ಅಧಿಕಾರಿಯನ್ನು (PDO) ಭೇಟಿ ಮಾಡಿ ಉದ್ಯಮಕ್ಕೆ ಅಗತ್ಯವಿರುವ ಪರವಾನಗಿ ಮತ್ತು ನಿರಾಕ್ಷೇಪಣಾ ಪತ್ರದ ಬಗ್ಗೆ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.',
      icon: Building,
    },
    {
      id: 4,
      titleEn: 'Bank Branch Manager Visit with GramRozgar Report',
      titleKn: 'ಬ್ಯಾಂಕ್ ಮ್ಯಾನೇಜರ್ ಭೇಟಿ ಮತ್ತು GramRozgar ಪ್ರಾಜೆಕ್ಟ್ ರಿಪೋರ್ಟ್ ಸಲ್ಲಿಕೆ',
      descEn:
        'Print your GramRozgar Business Feasibility Report and take it to your nearest lead bank branch. Inquire about MUDRA Shishu/Kishore or PMEGP subsidy.',
      descKn:
        'GramRozgar ನೀಡುವ ಅಧಿಕೃತ ವರದಿಯನ್ನು ಪ್ರಿಂಟ್ ತೆಗೆದುಕೊಂಡು ಹತ್ತಿರದ ಲೀಡ್ ಬ್ಯಾಂಕ್ ಶಾಖೆಗೆ ಭೇಟಿ ನೀಡಿ ಮುದ್ರಾ ಅಥವಾ PMEGP ಸಾಲಕ್ಕೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.',
      icon: FileCheck,
    },
    {
      id: 5,
      titleEn: 'Supplier Price Quotations & Machinery Setup',
      titleKn: 'ಸರಕು ಮತ್ತು ಯಂತ್ರಗಳ ಅಧಿಕೃತ ಕೊಟೇಶನ್ (Quotation) ಪಡೆಯುವುದು',
      descEn:
        'Collect formal stamped quotations from authorized machinery/wholesale distributors required for bank disbursement.',
      descKn:
        'ಬ್ಯಾಂಕ್ ಸಾಲ ಮಂಜೂರಾತಿಗೆ ಬೇಕಾದ ಸಾಮಗ್ರಿಗಳು ಮತ್ತು ಯಂತ್ರಗಳ ಅಧಿಕೃತ ಕೊಟೇಶನ್ ಅನ್ನು ವಿತರಕರಿಂದ ಪಡೆದುಕೊಳ್ಳಿ.',
      icon: FileText,
    },
  ];

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (id: number) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            {categoryTitle}
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
            {t.nextStepsHeading}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-600">
            {t.nextStepsSubheading}
          </p>
        </div>

        <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          {completedSteps.length} / {defaultSteps.length} {isKn ? 'ಮುಗಿದಿದೆ' : 'Completed'}
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {defaultSteps.map((step) => {
          const isDone = completedSteps.includes(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                isDone
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
              }`}
            >
              <button
                type="button"
                className="mt-1 text-stone-400 hover:text-emerald-700 transition-colors"
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                ) : (
                  <Circle className="w-5 h-5 text-stone-300" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-stone-400 font-mono">
                    Step {step.id}
                  </span>
                  <h3
                    className={`text-sm sm:text-base font-bold ${
                      isDone ? 'text-emerald-950 line-through' : 'text-stone-900'
                    }`}
                  >
                    {isKn ? step.titleKn : step.titleEn}
                  </h3>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {isKn ? step.descKn : step.descEn}
                </p>
              </div>

              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-stone-100 items-center justify-center text-stone-500 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
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
          <span>{t.nextStepsNextCta}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
