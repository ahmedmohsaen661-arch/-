'use client';

import React, { useEffect } from 'react';
import { X, Heart, Sparkles, Feather } from 'lucide-react';
import { MemoryCard } from '@/lib/types';

interface PhotoModalProps {
  card: MemoryCard | null;
  onClose: () => void;
}

export default function PhotoModal({ card, onClose }: PhotoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200/80 overflow-hidden transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft Golden/Pink Glow Background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-100/60 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-100/50 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition-colors z-20 shadow-sm"
          aria-label="إغلاق النافذة"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Card Header & Title */}
        <div className="flex items-center gap-2 mb-4 pr-1">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 font-cairo">
            {card.title}
          </h3>
        </div>

        {/* High Quality Photo Display */}
        <div className="relative rounded-2xl overflow-hidden shadow-md border border-rose-100 mb-6 bg-rose-50/40">
          <img
            src={card.image}
            alt={card.title}
            className="w-full h-64 sm:h-80 object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Romantic Note Box ("الملاحظة") */}
        <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-cream-50 via-rose-50/40 to-amber-50/30 border border-rose-200/60 shadow-inner">
          <div className="flex items-center justify-between mb-3 border-b border-rose-200/40 pb-2">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base sm:text-lg font-cairo">
              <Feather className="w-5 h-5 text-amber-600" />
              <span>الملاحظة</span>
            </div>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>

          <p className="text-gray-700 text-base sm:text-lg leading-relaxed sm:leading-loose font-amiri whitespace-pre-wrap">
            {card.note}
          </p>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-sm shadow-md transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

