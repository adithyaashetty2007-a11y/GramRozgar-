import React from 'react';
import { Language, SavedAnalysisRecord } from '../types';
import { T } from '../services/translations';
import { X, BookmarkCheck, ArrowRight, Calendar, MapPin, IndianRupee } from 'lucide-react';

interface SavedBusinessesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedList: SavedAnalysisRecord[];
  onSelectBusiness: (record: SavedAnalysisRecord) => void;
  language: Language;
}

export const SavedBusinessesModal: React.FC<SavedBusinessesModalProps> = ({
  isOpen,
  onClose,
  savedList,
  onSelectBusiness,
  language,
}) => {
  if (!isOpen) return null;
  const isKn = language === 'kn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-emerald-800" />
            <h3 className="text-base font-bold text-stone-900">
              {isKn ? 'ನನ್ನ ಉಳಿಸಿದ ವ್ಯವಹಾರಗಳು' : 'My Saved Businesses'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-3">
          {savedList.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              <BookmarkCheck className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p>
                {isKn
                  ? 'ಇನ್ನೂ ಯಾವುದೇ ವ್ಯವಹಾರವನ್ನು ಉಳಿಸಲಾಗಿಲ್ಲ.'
                  : 'No saved businesses yet. Analyze an idea and click "Save This Analysis" on the report screen.'}
              </p>
            </div>
          ) : (
            savedList.map((record) => (
              <div
                key={record.id}
                onClick={() => {
                  onSelectBusiness(record);
                  onClose();
                }}
                className="p-4 rounded-2xl border border-stone-200 hover:border-emerald-700 hover:bg-emerald-50/40 transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div>
                  <h4 className="text-sm font-bold text-stone-900 group-hover:text-emerald-950">
                    {record.businessTitle}
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-700" />
                      {record.locationName}
                    </span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-3 h-3 text-emerald-700" />
                      ₹{record.capital.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-stone-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(record.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {record.feasibilityScore}/100
                  </span>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-800 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
