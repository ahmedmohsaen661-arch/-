'use client';

import React, { useState } from 'react';
import { Heart, Sparkles, Feather, Image as ImageIcon, Gift, Star, Smile } from 'lucide-react';
import { SiteContent, MemoryCard } from '@/lib/types';
import PhotoModal from './PhotoModal';

interface SurpriseViewProps {
  content: SiteContent;
}

export default function SurpriseView({ content }: SurpriseViewProps) {
  const [selectedCard, setSelectedCard] = useState<MemoryCard | null>(null);

  return (
    <div className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-16 sm:space-y-24">
      
      {/* 1. Celebratory Hero Banner */}
      <section className="text-center relative pt-4 pb-8">
        
        {/* Soft glowing radial background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-gradient-to-tr from-rose-200/50 via-pink-200/40 to-amber-100/40 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse-subtle" />

        <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-rose-200 shadow-sm text-rose-600 text-sm sm:text-base font-semibold mb-6 animate-bounce">
          <Gift className="w-5 h-5 text-rose-500" />
          <span>مفاجأة عيد الميلاد السعيدة 🎂</span>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 leading-tight sm:leading-tight mb-6 max-w-3xl mx-auto drop-shadow-sm font-cairo">
          {content.celebrationTitle}
        </h1>

        <p className="text-gray-600 text-base sm:text-xl font-amiri max-w-2xl mx-auto leading-relaxed">
          اليوم مش مجرد تاريخ في السنة.. اليوم هو اليوم اللي اتولد فيه النور اللي منور حياتي كلها ❤️
        </p>
      </section>

      {/* 2. Main Love Letter Section ("رسالة من حبيبك ❤️") */}
      <section className="relative scroll-mt-20">
        
        {/* Parchment Container */}
        <div className="relative w-full rounded-3xl p-8 sm:p-14 bg-gradient-to-b from-[#fffefc] via-[#fdf9f3] to-[#fbf5eb] border border-[#f0decc] shadow-romantic-lg overflow-hidden transition-all duration-300">
          
          {/* Subtle Vintage Gold Edge Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-200 via-amber-400 to-rose-200 opacity-80" />
          
          {/* Wax Seal / Rose Badge Top Right */}
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-rose-600 to-red-700 shadow-md border-2 border-amber-300/80 transform -rotate-12 select-none">
            <Heart className="w-6 h-6 text-amber-100 fill-amber-100" />
          </div>

          {/* Section Header */}
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#ebd8c5]">
            <div className="p-3 rounded-2xl bg-rose-100/70 text-rose-600">
              <Feather className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800 font-cairo">
                {content.mainMessageTitle}
              </h2>
              <span className="text-xs sm:text-sm text-rose-500 font-medium">
                مكتوبة بكل حب من أعماق القلب..
              </span>
            </div>
          </div>

          {/* Dynamic Auto-Expanding Romantic Letter Text */}
          <div className="relative">
            <div className="text-gray-800 text-lg sm:text-2xl leading-loose sm:leading-[2.5] font-amiri whitespace-pre-wrap text-justify select-text">
              {content.mainMessage}
            </div>

            {/* Signature at bottom of letter */}
            <div className="mt-12 pt-6 border-t border-[#ebd8c5]/70 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 font-bold font-cairo text-base sm:text-lg">
                <Heart className="w-5 h-5 fill-rose-600" />
                <span>حبيبك للأبد</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-400 font-amiri">
                31 أكتوبر 2026
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Memories Section ("ذكرياتنا سوا 📸❤️") */}
      <section className="relative scroll-mt-20">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/70 text-rose-700 text-sm font-semibold mb-3">
            <ImageIcon className="w-4 h-4" />
            <span>لحظات لا تُنسى</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 font-cairo">
            {content.memoriesTitle}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2 font-cairo">
            اضغطي على أي صورة لقراءة الملاحظة وسر الذكرى دي في قلبي ❤️
          </p>
        </div>

        {/* 4 Photo Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {content.memories.map((card) => (
            <div
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="group cursor-pointer rounded-3xl bg-white/90 backdrop-blur-md border border-rose-100 p-4 sm:p-5 shadow-soft hover:shadow-romantic-lg transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Image Frame */}
              <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-rose-50 mb-4">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Overlay hover prompt */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                  <span className="px-4 py-2 rounded-full bg-white/90 text-rose-700 text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    اضغطي لقراءة الملاحظة
                  </span>
                </div>
              </div>

              {/* Title & Card Footer */}
              <div className="flex items-center justify-between px-2 py-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-rose-600 transition-colors font-cairo line-clamp-1">
                  {card.title}
                </h3>
                <div className="p-2 rounded-full bg-rose-50 group-hover:bg-rose-100 text-rose-500 transition-colors">
                  <Heart className="w-4 h-4 group-hover:fill-rose-500 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Dala' Section ("دلع بنوتي 🥰") */}
      <section className="relative scroll-mt-20 pb-10">
        
        {/* Floating Sweet Card */}
        <div className="relative max-w-3xl mx-auto rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-pink-50/90 via-white/95 to-purple-50/80 border border-pink-200/70 shadow-romantic overflow-hidden">
          
          {/* Subtle playful corner decorations */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-rose-200/50 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-amber-200/40 rounded-full blur-xl pointer-events-none" />

          {/* Section Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-pink-100 text-pink-600 mb-3 shadow-inner">
              <Smile className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-800 font-cairo">
              {content.dalaaTitle}
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mt-2 font-cairo">
              ألقابك وأساميكِ اللي بتدفي قلبي كل ما بناديكي بيها 💕
            </p>
          </div>

          {/* Dala' Nicknames Cloud */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {content.dalaaWords.map((word, index) => (
              <div
                key={index}
                className="group px-5 py-3 rounded-full bg-white/95 border border-pink-200 shadow-sm hover:shadow-md hover:border-pink-300 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 text-gray-800 hover:text-rose-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm sm:text-base font-bold cursor-default select-none"
              >
                <Star className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                <span>{word}</span>
                <Heart className="w-3.5 h-3.5 text-pink-400 group-hover:fill-pink-500 group-hover:text-pink-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Modal Pop-up */}
      <PhotoModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
}

