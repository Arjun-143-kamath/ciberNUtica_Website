'use client';

import React, { useEffect, useRef } from 'react';

export function CyberGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;
    let tilt = 0.35;
    let velocity = 0.007;
    let isDragging = false;
    let previousX = 0;
    let previousY = 0;

    // Particle sphere generator
    const numPoints = 280;
    const points: Array<{ x: number; y: number; z: number }> = [];
    const radius = 140;

    for (let i = 0; i < numPoints; i++) {
      const theta = Math.acos(1 - 2 * (i / numPoints));
      const phi = Math.PI * (1 + Math.sqrt(5)) * i;

      points.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta)
      });
    }

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Interactive pointer handlers for drag-to-orbit
    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousX = e.clientX;
      previousY = e.clientY;
      velocity = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousX;
      const deltaY = e.clientY - previousY;

      rotation += deltaX * 0.006;
      tilt = Math.max(-0.8, Math.min(0.8, tilt + deltaY * 0.004));

      velocity = deltaX * 0.003;
      previousX = e.clientX;
      previousY = e.clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Apply rotation with smooth momentum decaying to default spin
      if (!isDragging) {
        if (Math.abs(velocity) > 0.007) {
          velocity *= 0.95;
        } else {
          velocity = 0.007;
        }
        rotation += velocity;
      }

      // Draw faint cyber latitude rings
      ctx.strokeStyle = 'rgba(252, 238, 9, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy, radius, radius * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Project and draw particles
      points.forEach((pt) => {
        // Rotate around Y axis
        const cosY = Math.cos(rotation);
        const sinY = Math.sin(rotation);
        const xRot = pt.x * cosY + pt.z * sinY;
        const zRot = -pt.x * sinY + pt.z * cosY;

        // Dynamic tilt around X axis
        const cosX = Math.cos(tilt);
        const sinX = Math.sin(tilt);
        const yRot = pt.y * cosX - zRot * sinX;
        const finalZ = pt.y * sinX + zRot * cosX;

        // Perspective projection
        const fov = 350;
        const scale = fov / (fov + finalZ);
        const px = cx + xRot * scale;
        const py = cy + yRot * scale;

        // Depth alpha calculation
        const alpha = Math.max(0.14, (finalZ + radius) / (2 * radius));
        const size = Math.max(1.2, ((finalZ + radius) / (radius * 0.95)) * 1.1);

        ctx.fillStyle = `rgba(252, 238, 9, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw cyber target reticle in center
      ctx.strokeStyle = isDragging ? 'rgba(252, 238, 9, 0.5)' : 'rgba(252, 238, 9, 0.25)';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  return (
    <div className="relative w-full h-[320px] md:h-[390px] flex items-center justify-center overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[500px] cursor-grab active:cursor-grabbing touch-none"
      />
    </div>
  );
}
