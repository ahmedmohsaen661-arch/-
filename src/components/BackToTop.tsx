'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp, Heart } from 'lucide-react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-white/90 hover:bg-white text-rose-600 shadow-romantic border border-rose-200/80 transition-all duration-300 hover:scale-110 active:scale-95 group"
      aria-label="العودة إلى أعلى الصفحة"
    >
      <ArrowUp className="w-5 h-5 text-rose-500 group-hover:-translate-y-0.5 transition-transform duration-200" />
      <span className="sr-only">أعلى الصفحة</span>
    </button>
  );
}

