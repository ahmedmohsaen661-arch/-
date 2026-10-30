'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Clock } from 'lucide-react';

interface CountdownProps {
  greeting: string;
  targetDateStr?: string;
  onComplete: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isFinished: boolean;
}

export default function Countdown({ greeting, targetDateStr = '2026-10-31T00:00:00+02:00', onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isFinished: false,
  });
  const [mounted, setMounted] = useState(false);

  const calculateCairoTimeLeft = (): TimeLeft => {
    try {
      // Current time converted to Africa/Cairo
      const nowCairoString = new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' });
      const nowCairo = new Date(nowCairoString);

      // Target Cairo time: October 31, 2026 00:00:00
      let targetCairo: Date;
      if (targetDateStr) {
        // Parse date
        const parsed = new Date(targetDateStr);
        if (!isNaN(parsed.getTime())) {
          const targetCairoString = parsed.toLocaleString('en-US', { timeZone: 'Africa/Cairo' });
          targetCairo = new Date(targetCairoString);
        } else {
          targetCairo = new Date(2026, 9, 31, 0, 0, 0);
        }
      } else {
        targetCairo = new Date(2026, 9, 31, 0, 0, 0);
      }

      const diff = targetCairo.getTime() - nowCairo.getTime();

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, isFinished: false };
    } catch {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: false };
    }
  };

  useEffect(() => {
    setMounted(true);
    const initial = calculateCairoTimeLeft();
    setTimeLeft(initial);

    if (initial.isFinished) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      const current = calculateCairoTimeLeft();
      setTimeLeft(current);

      if (current.isFinished) {
        clearInterval(timer);
        // Trigger celebratory fireworks
        launchCelebrationConfetti();
        onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDateStr]);

  const launchCelebrationConfetti = () => {
    const duration = 5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f43f5e', '#ec4899', '#fbcfe8', '#f59e0b', '#fbbf24']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f43f5e', '#ec4899', '#fbcfe8', '#f59e0b', '#fbbf24']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  const timeUnits = [
    { label: 'يوم', value: timeLeft.days },
    { label: 'ساعة', value: timeLeft.hours },
    { label: 'دقيقة', value: timeLeft.minutes },
    { label: 'ثانية', value: timeLeft.seconds },
  ];

  return (
    <div className="relative z-20 flex flex-col items-center justify-center min-h-[85vh] px-4 py-12 text-center max-w-4xl mx-auto">
      
      {/* Gentle Floating Glowing Orb Backdrop */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-pink-200/40 via-rose-200/30 to-amber-100/30 blur-3xl -z-10 pointer-events-none animate-pulse-subtle" />

      {/* Decorative Romantic Tag */}
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/70 backdrop-blur-md border border-rose-200/70 shadow-sm text-rose-600 text-sm sm:text-base font-medium mb-6">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span>العد التنازلي لميلاد أجمل أقداري</span>
        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
      </div>

      {/* Main Greeting Heading */}
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 leading-relaxed sm:leading-tight mb-8 max-w-2xl text-balance drop-shadow-sm font-cairo">
        {greeting}
      </h1>

      {/* Countdown Board */}
      <div className="w-full max-w-3xl p-6 sm:p-10 rounded-3xl bg-white/80 backdrop-blur-xl border border-rose-100/80 shadow-romantic relative overflow-hidden">
        
        {/* Subtle decorative golden edge accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-rose-100 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-purple-100 rounded-full blur-xl pointer-events-none" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          {timeUnits.map((unit, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-white/95 to-rose-50/70 border border-rose-100 shadow-soft hover:shadow-romantic transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative">
                <span className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-rose-600 via-pink-600 to-purple-600 tabular-nums">
                  {String(unit.value).padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-rose-800/80 mt-2 tracking-wide">
                {unit.label}
              </span>
            </div>
          ))}
        </div>

        {/* Egypt Local Time Note */}
        <div className="mt-8 pt-6 border-t border-rose-100/80 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-gray-500 font-medium">
          <Clock className="w-4 h-4 text-rose-400" />
          <span>موعد اللحظة السحرية:</span>
          <span className="font-semibold text-rose-700 dir-ltr inline-block">12:00 AM - 31 أكتوبر 2026</span>
          <span className="text-gray-400 font-normal">(بتوقيت مصر - Africa/Cairo)</span>
        </div>
      </div>

      {/* Sweet love whisper under countdown */}
      <p className="text-rose-700/80 text-sm sm:text-base font-amiri italic mt-6 max-w-lg leading-relaxed">
        &quot;كل ثانية بتمر مش بس بتقربنا، دي بتفكرني قد إيه أنتي أعظم نعمة ربنا جمل بيها أيامي...&quot;
      </p>
    </div>
  );
}

