'use client';

import React, { useEffect, useRef } from 'react';

interface Heart {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export default function FloatingHearts() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const colors = [
      'rgba(244, 63, 94, 0.4)',   // Romantic rose
      'rgba(251, 113, 133, 0.35)', // Soft pink
      'rgba(216, 180, 254, 0.35)', // Soft mauve
      'rgba(234, 179, 8, 0.3)',    // Soft gold
      'rgba(254, 205, 211, 0.45)', // Creamy pink
    ];

    const hearts: Heart[] = [];
    const maxHearts = Math.min(35, Math.floor(width / 35));

    function createHeart(startY?: number): Heart {
      return {
        x: Math.random() * width,
        y: startY !== undefined ? startY : height + Math.random() * 20,
        size: Math.random() * 14 + 10,
        speedY: Math.random() * 0.7 + 0.4,
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      };
    }

    // Initialize initial hearts scattered across canvas
    for (let i = 0; i < maxHearts; i++) {
      hearts.push(createHeart(Math.random() * height));
    }

    function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, rotation: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      // top left curve
      ctx.bezierCurveTo(
        -size / 2, -size / 2,
        -size, topCurveHeight / 3,
        0, size
      );
      // top right curve
      ctx.bezierCurveTo(
        size, topCurveHeight / 3,
        size / 2, -size / 2,
        0, topCurveHeight
      );

      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < hearts.length; i++) {
        const h = hearts[i];
        h.y -= h.speedY;
        h.x += h.speedX + Math.sin(h.y * 0.01) * 0.3;
        h.rotation += h.rotationSpeed;

        if (h.y < -h.size * 2) {
          hearts[i] = createHeart(height + 10);
        }

        drawHeart(ctx, h.x, h.y, h.size, h.color, h.rotation);
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 opacity-70"
      aria-hidden="true"
    />
  );
}

