import React, { useEffect, useRef } from 'react';

const WaterEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let ripples = [];
    let animationFrameId;

    let lastX = 0;
    let lastY = 0;

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Only spawn a new ripple if mouse has moved a reasonable distance
      const dist = Math.hypot(x - lastX, y - lastY);
      if (dist < 15) return;

      lastX = x;
      lastY = y;

      // Spawn a ripple
      ripples.push({
        x,
        y,
        radius: 2,
        maxRadius: 160 + Math.random() * 60,
        opacity: 0.7,
        speed: 1.2 + Math.random() * 0.8,
      });

      // Limit max active ripples to keep performance high
      if (ripples.length > 50) {
        ripples.shift();
      }
    };

    const parent = canvas.parentElement;
    parent.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        
        // Simulating physical drag/viscosity: expansion slows down over time
        r.radius += r.speed;
        r.speed *= 0.982; 
        
        // Slowly fading out the ripple (making it stay for around 2-3 seconds)
        r.opacity -= 0.0035;

        if (r.opacity <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        // --- 1. Outer Primary Wave Front ---
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        
        const outerGrad = ctx.createRadialGradient(r.x, r.y, r.radius * 0.85, r.x, r.y, r.radius);
        outerGrad.addColorStop(0, 'rgba(0, 212, 255, 0)');
        outerGrad.addColorStop(0.5, `rgba(0, 212, 255, ${r.opacity * 0.12})`);
        outerGrad.addColorStop(0.8, `rgba(124, 58, 237, ${r.opacity * 0.06})`);
        outerGrad.addColorStop(1, 'rgba(0, 212, 255, 0)');

        ctx.fillStyle = outerGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.97, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${r.opacity * 0.06})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // --- 2. Inner Secondary Wave Front (Trough Follower) ---
        if (r.radius > 20) {
          const innerRadius = r.radius * 0.7;
          ctx.beginPath();
          ctx.arc(r.x, r.y, innerRadius, 0, Math.PI * 2);

          const innerGrad = ctx.createRadialGradient(r.x, r.y, innerRadius * 0.85, r.x, r.y, innerRadius);
          innerGrad.addColorStop(0, 'rgba(0, 212, 255, 0)');
          innerGrad.addColorStop(0.5, `rgba(0, 212, 255, ${r.opacity * 0.06})`);
          innerGrad.addColorStop(1, 'rgba(0, 212, 255, 0)');

          ctx.fillStyle = innerGrad;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(r.x, r.y, innerRadius * 0.97, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${r.opacity * 0.03})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      parent.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default WaterEffect;
