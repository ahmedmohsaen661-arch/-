'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Music, VolumeX, Volume2, Sparkles } from 'lucide-react';

interface AudioPlayerProps {
  customMusicUrl?: string;
}

export default function AudioPlayer({ customMusicUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Romantic music box notes (pentatonic dreamy scale in C / G major: C4, E4, G4, A4, B4, C5, D5, E5, G5)
  const notes = [261.63, 329.63, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 783.99];

  const playSynthesizedMelody = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Progression sequence
      const melodyPattern = [0, 2, 4, 7, 5, 4, 2, 3, 5, 7, 8, 7, 4, 2];
      let step = 0;

      const playChime = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
        const now = ctx.currentTime;
        
        // Pick note from progression + slight random harmonic
        const noteIndex = melodyPattern[step % melodyPattern.length];
        const freq = notes[noteIndex % notes.length];
        step++;

        // Oscillator 1 (soft sine)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Gentle envelope (soft attack, dreamy decay)
        const currentGain = volume * 0.15;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(currentGain, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.9);

        // Harmonizing bell overtone
        if (Math.random() > 0.4) {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(freq * 2, now + 0.1);
          gain2.gain.setValueAtTime(0.0001, now + 0.1);
          gain2.gain.linearRampToValueAtTime(currentGain * 0.35, now + 0.15);
          gain2.gain.exponentialRampToValueAtTime(0.00001, now + 1.2);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(now + 0.1);
          osc2.stop(now + 1.3);
        }
      };

      // Play chime every 650ms
      playChime();
      synthIntervalRef.current = setInterval(playChime, 650);
    } catch (err) {
      console.warn('Web Audio synthesis unavailable:', err);
    }
  };

  const stopSynthesizedMelody = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.suspend();
    }
  };

  const toggleMusic = async () => {
    if (isPlaying) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      stopSynthesizedMelody();
      setIsPlaying(false);
    } else {
      // Try playing audio file first
      let filePlayed = false;
      if (audioRef.current && customMusicUrl) {
        try {
          audioRef.current.volume = volume;
          await audioRef.current.play();
          filePlayed = true;
          setIsPlaying(true);
        } catch {
          filePlayed = false;
        }
      }

      // If no file or file playback failed, use the romantic Web Audio synthesizer!
      if (!filePlayed) {
        playSynthesizedMelody();
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      stopSynthesizedMelody();
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-3">
      {customMusicUrl && (
        <audio
          ref={audioRef}
          src={customMusicUrl}
          loop
          preload="none"
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Floating Pill Player */}
      <div
        className="relative group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          onClick={toggleMusic}
          className={`relative p-3.5 rounded-full backdrop-blur-md shadow-romantic transition-all duration-300 flex items-center justify-center border ${
            isPlaying
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-300 shadow-gold-glow animate-pulse-subtle'
              : 'bg-white/80 hover:bg-white text-rose-600 border-rose-200/60 hover:shadow-lg'
          }`}
          aria-label={isPlaying ? 'إيقاف الموسيقى الرومانسية' : 'تشغيل موسيقى رومانسية هادئة'}
        >
          {isPlaying ? (
            <div className="flex items-center gap-1.5">
              <span className="flex h-3 w-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="flex h-4 w-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="flex h-2.5 w-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <Music className="w-5 h-5 text-rose-500 transition-transform duration-300 group-hover:scale-110" />
          )}

          {/* Golden sparkle badge */}
          <span className="absolute -top-1 -right-1 text-amber-400">
            <Sparkles className="w-3.5 h-3.5 drop-shadow" />
          </span>
        </button>

        {/* Tooltip */}
        <div
          className={`absolute bottom-full left-0 mb-2 px-3 py-1.5 rounded-xl bg-white/95 text-xs text-rose-800 font-medium whitespace-nowrap shadow-md border border-rose-100 transition-all duration-200 pointer-events-none ${
            showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          }`}
        >
          {isPlaying ? 'إيقاف اللحن الرومانسي 🎶' : 'تشغيل لحن رومانسي هادئ 🎵'}
        </div>
      </div>
    </div>
  );
}

