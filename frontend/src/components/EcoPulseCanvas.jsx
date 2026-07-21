import { useEffect, useRef } from "react";
import { Leaf, Sparkles, Sprout } from "lucide-react";

export default function EcoPulseCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, isHovered: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = 240;
    const height = 240;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let animationFrameId;
    let angle = 0;

    // Generate floating eco particles
    const particles = Array.from({ length: 24 }, () => ({
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 160,
      z: (Math.random() - 0.5) * 160,
      radius: Math.random() * 2 + 1.2,
      speed: Math.random() * 0.015 + 0.008,
      color: Math.random() > 0.4 ? "#34d399" : Math.random() > 0.5 ? "#6EE7B7" : "#FBBF24",
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      angle += 0.012;

      // 1. Draw glowing background aura
      const auraGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 95);
      auraGrad.addColorStop(0, "rgba(52, 211, 153, 0.25)");
      auraGrad.addColorStop(0.5, "rgba(16, 185, 129, 0.12)");
      auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 95, 0, Math.PI * 2);
      ctx.fill();

      // 2. Outer Rotating Orbital Ring 1 (Emerald)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, 82, 34, Math.PI / 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(52, 211, 153, 0.45)";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 6]);
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#34d399";
      ctx.stroke();
      ctx.restore();

      // 3. Counter-Rotating Orbital Ring 2 (Cyan/Mint)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-angle * 0.85);
      ctx.beginPath();
      ctx.ellipse(0, 0, 75, 28, -Math.PI / 3, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(110, 231, 183, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([12, 8]);
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#6ee7b7";
      ctx.stroke();
      ctx.restore();

      // 4. Gold Inner Energy Accent Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 1.4);
      ctx.beginPath();
      ctx.arc(0, 0, 56, 0, Math.PI * 1.5);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.55)";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#fbbf24";
      ctx.stroke();
      ctx.restore();

      // 5. Draw 3D Floating Particles
      particles.forEach((p) => {
        // Rotate particle around Y-axis
        const cos = Math.cos(p.speed);
        const sin = Math.sin(p.speed);
        const x1 = p.x * cos - p.z * sin;
        const z1 = p.x * sin + p.z * cos;
        p.x = x1;
        p.z = z1;

        // Projection
        const scale = 140 / (140 + p.z);
        const px = cx + p.x * scale;
        const py = cy + p.y * scale;

        if (scale > 0) {
          ctx.beginPath();
          ctx.arc(px, py, p.radius * scale, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
        }
      });

      // 6. Central Glowing Pulse Core
      const pulseRadius = 38 + Math.sin(angle * 3) * 3;
      const coreGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, pulseRadius);
      coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      coreGrad.addColorStop(0.3, "rgba(52, 211, 153, 0.8)");
      coreGrad.addColorStop(0.7, "rgba(16, 185, 129, 0.3)");
      coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#34d399";
      ctx.fill();

      ctx.shadowBlur = 0; // reset
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="relative w-[240px] h-[240px] flex items-center justify-center select-none group">
      {/* 3D Dynamic Orbital Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Central Floating Glass Emblem Icon */}
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 shadow-2xl flex items-center justify-center text-emerald-300 group-hover:scale-110 group-hover:border-emerald-400/70 transition duration-500">
        <Sprout size={32} className="text-emerald-300 drop-shadow-md animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute -top-1 -right-1">
          <Sparkles size={14} className="text-amber-300 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
