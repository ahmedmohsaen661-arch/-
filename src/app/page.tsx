'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Heart, Sparkles } from 'lucide-react';
import Countdown from '@/components/Countdown';
import SurpriseView from '@/components/SurpriseView';
import AdminModal from '@/components/AdminModal';
import { SiteContent } from '@/lib/types';
import confetti from 'canvas-confetti';

export default function HomePage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial content
  const loadContent = async () => {
    try {
      const res = await fetch('/api/content', { cache: 'no-store' });
      const data = await res.json();
      setContent(data);
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleCountdownFinished = async () => {
    try {
      // Trigger permanent unlock in DB
      await fetch('/api/content/unlock', { method: 'POST' });
      
      // Update local state to show surprise
      if (content) {
        setContent({ ...content, isUnlocked: true });
      }

      // Celebratory confetti bursts
      const count = 200;
      const defaults = { origin: { y: 0.7 } };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#facc15']
      });
      fire(0.2, {
        spread: 60,
        colors: ['#ec4899', '#f43f5e', '#e879f9', '#fbbf24']
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#fda4af', '#f43f5e', '#fef08a']
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    } catch (err) {
      console.error('Error during countdown completion:', err);
    }
  };

  if (isLoading || !content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="mt-4 text-rose-600 font-bold text-sm tracking-wide">
          جارٍ تحضير المفاجأة بكل حب...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col justify-between relative selection:bg-rose-200 selection:text-rose-900">
      
      {/* Top Header with discreet Admin Lock button */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-4 flex items-center justify-between max-w-6xl mx-auto">
        {/* Subtle Brand/Rose Icon */}
        <div className="flex items-center gap-2 text-rose-600">
          <div className="w-8 h-8 rounded-full bg-rose-100/80 flex items-center justify-center border border-rose-200/60 shadow-sm">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-rose-700 font-cairo">
            عيد ميلاد حبيبتي ❤️
          </span>
        </div>

        {/* Discreet Elegant Admin Dashboard Button */}
        <button
          onClick={() => setIsAdminOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 hover:bg-white text-gray-500 hover:text-rose-600 border border-rose-200/50 hover:border-rose-300 shadow-sm transition-all duration-200 text-xs font-semibold backdrop-blur-sm group"
          title="لوحة التحكم الإدارية (خاصة بك)"
        >
          <Lock className="w-3.5 h-3.5 text-gray-400 group-hover:text-rose-500 transition-colors" />
          <span>لوحة التحكم</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        {content.isUnlocked ? (
          <SurpriseView content={content} />
        ) : (
          <Countdown
            greeting={content.countdownGreeting}
            targetDateStr={content.targetDate}
            onComplete={handleCountdownFinished}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-20 py-8 text-center text-xs text-rose-800/60 border-t border-rose-100/60 mt-12 bg-white/40 backdrop-blur-sm font-cairo">
        <div className="flex items-center justify-center gap-1.5 mb-1 text-sm font-semibold text-rose-600">
          <span>صُنع بحب وعشق لا ينتهي لأجمل أميرة</span>
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500 inline" />
        </div>
        <p className="text-gray-400">
          31 أكتوبر 2005 - بداية حكاية أجمل قمر ✨
        </p>
      </footer>

      {/* Admin Dashboard Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        content={content}
        onContentUpdated={(newContent) => setContent(newContent)}
      />
    </main>
  );
}

