import { useEffect, useRef } from "react";
import { Sprout, Sparkles } from "lucide-react";

export default function EcoTreeVisualizer({ summary }) {
  const canvasRef = useRef(null);

  const treesCount = summary ? Math.max(1, Math.round(summary.totalKgCo2e / 12)) : 3;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = 230;
    const height = 230;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let animationFrameId;
    let angle = 0;

    // Drifting leaf / pollen particles
    const particles = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: height - Math.random() * 80,
      size: Math.random() * 2.5 + 1,
      speedY: Math.random() * 0.4 + 0.2,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.7 + 0.3,
      color: Math.random() > 0.4 ? "#34d399" : Math.random() > 0.5 ? "#6ee7b7" : "#a7f3d0",
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2 + 10;

      angle += 0.02;

      // 1. Ambient Soil Base & Aura Glow
      const auraGrad = ctx.createRadialGradient(cx, cy + 45, 10, cx, cy + 45, 90);
      auraGrad.addColorStop(0, "rgba(52, 211, 153, 0.3)");
      auraGrad.addColorStop(0.6, "rgba(16, 185, 129, 0.12)");
      auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, cy + 45, 90, 0, Math.PI * 2);
      ctx.fill();

      // Base Mound (Muted Soil Ring)
      ctx.beginPath();
      ctx.ellipse(cx, cy + 50, 55, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(20, 83, 45, 0.4)";
      ctx.fill();
      ctx.strokeStyle = "rgba(52, 211, 153, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 2. Tree Trunk (Organic Curved Branches)
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy + 50);
      ctx.quadraticCurveTo(cx - 3, cy + 15, cx - 18, cy - 10); // left branch
      ctx.quadraticCurveTo(cx - 2, cy + 10, cx + 18, cy - 15); // right branch
      ctx.quadraticCurveTo(cx + 4, cy + 15, cx + 8, cy + 50);
      ctx.closePath();

      const trunkGrad = ctx.createLinearGradient(cx, cy - 15, cx, cy + 50);
      trunkGrad.addColorStop(0, "#15803d");
      trunkGrad.addColorStop(1, "#052e16");
      ctx.fillStyle = trunkGrad;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#15803d";
      ctx.fill();
      ctx.shadowBlur = 0;

      // 3. Foliage Clusters (Lush Glowing Emerald Circles with breathing sway)
      const sway = Math.sin(angle) * 3;

      const foliageClusters = [
        { x: cx + sway, y: cy - 40, r: 34, color: "#10b981" },
        { x: cx - 22 + sway * 0.8, y: cy - 22, r: 26, color: "#059669" },
        { x: cx + 24 + sway * 0.8, y: cy - 25, r: 28, color: "#047857" },
        { x: cx - 12 + sway, y: cy - 52, r: 24, color: "#34d399" },
        { x: cx + 14 + sway, y: cy - 50, r: 22, color: "#6ee7b7" },
        { x: cx + sway * 1.2, y: cy - 64, r: 18, color: "#a7f3d0" },
      ];

      foliageClusters.forEach((c) => {
        const leafGrad = ctx.createRadialGradient(c.x - c.r * 0.3, c.y - c.r * 0.3, c.r * 0.1, c.x, c.y, c.r);
        leafGrad.addColorStop(0, c.color);
        leafGrad.addColorStop(1, "#064e3b");

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = leafGrad;
        ctx.shadowBlur = 12;
        ctx.shadowColor = c.color;
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // 4. Drifting Pollen / Leaf Particles
      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(angle + p.y * 0.02) * 0.2;

        if (p.y < 20) {
          p.y = height - 20;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="relative w-[230px] h-[230px] flex flex-col items-center justify-center select-none group">
      {/* 3D Growing Eco Tree Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Floating Restoration Status Pill */}
      <div className="absolute bottom-2 z-10 bg-brand-950/80 backdrop-blur-md border border-emerald-500/40 rounded-full px-3.5 py-1.5 flex items-center gap-1.5 shadow-lg group-hover:scale-105 group-hover:border-emerald-400 transition duration-300">
        <Sprout size={13} className="text-emerald-400 animate-bounce" />
        <span className="text-[11px] font-extrabold text-white tracking-wide">
          {treesCount} Virtual {treesCount === 1 ? "Tree" : "Trees"} Growing
        </span>
        <Sparkles size={11} className="text-amber-300 ml-0.5" />
      </div>
    </div>
  );
}
