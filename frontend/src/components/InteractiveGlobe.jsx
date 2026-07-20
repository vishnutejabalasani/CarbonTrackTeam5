import { useEffect, useRef, useState } from "react";
import { Globe, RefreshCw } from "lucide-react";

export default function InteractiveGlobe() {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);

  // Set up mock flight routes/coordinates on the globe (x, y, z coordinates in 3D space)
  const routes = [
    { name: "London ➔ New York", color: "#818cf8", start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 40.7128, lng: -74.0060 } },
    { name: "Tokyo ➔ San Francisco", color: "#fbbf24", start: { lat: 35.6762, lng: 139.6503 }, end: { lat: 37.7749, lng: -122.4194 } },
    { name: "Berlin ➔ New Delhi", color: "#38bdf8", start: { lat: 52.5200, lng: 13.4050 }, end: { lat: 28.6139, lng: 77.2090 } }
  ];

  // Helper to project lat/lng onto 3D sphere coordinate
  const project = (lat, lng, radius) => {
    const radLat = (lat * Math.PI) / 180;
    const radLng = (lng * Math.PI) / 180;
    return {
      x: radius * Math.cos(radLat) * Math.sin(radLng),
      y: -radius * Math.sin(radLat),
      z: radius * Math.cos(radLat) * Math.cos(radLng)
    };
  };

  // 3D rotation projection helper
  const rotate3D = (point, angleX, angleY) => {
    // Rotate Y (longitude rotation)
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    let x1 = point.x * cosY - point.z * sinY;
    let z1 = point.x * sinY + point.z * cosY;

    // Rotate X (latitude rotation)
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    let y2 = point.y * cosX - z1 * sinX;
    let z2 = point.y * sinX + z1 * cosX;

    return { x: x1, y: y2, z: z2 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let angleX = rotation.x;
    let angleY = rotation.y;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = 76; // Increased from 68 to make the globe larger

      // Auto-rotation when not dragging
      if (autoRotateRef.current && !isDragging) {
        angleY += 0.005;
      }

      // Draw Globe Shading & Glow Aura
      ctx.shadowBlur = 16;
      ctx.shadowColor = "rgba(52, 211, 153, 0.55)";
      
      const sphereGrad = ctx.createRadialGradient(cx - 15, cy - 15, 10, cx, cy, radius);
      sphereGrad.addColorStop(0, "#0e331c");
      sphereGrad.addColorStop(0.7, "#051a0e");
      sphereGrad.addColorStop(1, "#020905");
      
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fillStyle = sphereGrad;
      ctx.fill();
      
      // Outline glow stroke
      ctx.strokeStyle = "rgba(52, 211, 153, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow for rest of draw calls

      // Draw Grid lines (parallels & meridians)
      ctx.lineWidth = 0.5;
      const gridDensity = 8; // More grid lines for higher fidelity
      for (let i = 0; i < gridDensity; i++) {
        // Draw latitude circles
        const lat = -80 + (160 / gridDensity) * i;
        ctx.beginPath();
        for (let lng = -180; lng <= 180; lng += 8) {
          const pt3D = project(lat, lng, radius);
          const rotated = rotate3D(pt3D, angleX, angleY);
          if (rotated.z >= 0) {
            if (lng === -180) ctx.moveTo(cx + rotated.x, cy + rotated.y);
            else ctx.lineTo(cx + rotated.x, cy + rotated.y);
          }
        }
        ctx.strokeStyle = "rgba(52, 211, 153, 0.18)";
        ctx.stroke();

        // Draw longitude ellipses
        const lng = -180 + (360 / gridDensity) * i;
        ctx.beginPath();
        for (let latVal = -90; latVal <= 90; latVal += 8) {
          const pt3D = project(latVal, lng, radius);
          const rotated = rotate3D(pt3D, angleX, angleY);
          if (rotated.z >= 0) {
            if (latVal === -90) ctx.moveTo(cx + rotated.x, cy + rotated.y);
            else ctx.lineTo(cx + rotated.x, cy + rotated.y);
          }
        }
        ctx.strokeStyle = "rgba(52, 211, 153, 0.18)";
        ctx.stroke();
      }

      // Draw Flight Arcs
      routes.forEach((route) => {
        const startPt = project(route.start.lat, route.start.lng, radius);
        const endPt = project(route.end.lat, route.end.lng, radius);

        const rotatedStart = rotate3D(startPt, angleX, angleY);
        const rotatedEnd = rotate3D(endPt, angleX, angleY);

        if (rotatedStart.z >= 0 || rotatedEnd.z >= 0) {
          // Calculate midpoint pushed outward for arc bulge
          const midPt = {
            x: (startPt.x + endPt.x) * 0.55,
            y: (startPt.y + endPt.y) * 0.55,
            z: (startPt.z + endPt.z) * 0.55
          };
          // Pushing midpoint out
          const len = Math.sqrt(midPt.x * midPt.x + midPt.y * midPt.y + midPt.z * midPt.z);
          midPt.x = (midPt.x / len) * (radius * 1.35);
          midPt.y = (midPt.y / len) * (radius * 1.35);
          midPt.z = (midPt.z / len) * (radius * 1.35);

          const rotatedMid = rotate3D(midPt, angleX, angleY);

          // Draw bezier curve
          ctx.beginPath();
          ctx.moveTo(cx + rotatedStart.x, cy + rotatedStart.y);
          ctx.quadraticCurveTo(cx + rotatedMid.x, cy + rotatedMid.y, cx + rotatedEnd.x, cy + rotatedEnd.y);
          ctx.strokeStyle = route.color;
          ctx.lineWidth = 2.0;
          ctx.shadowBlur = 6;
          ctx.shadowColor = route.color;
          ctx.stroke();
          ctx.shadowBlur = 0; // reset shadow

          // Draw Glowing Points for locations
          if (rotatedStart.z >= 0) {
            ctx.beginPath();
            ctx.arc(cx + rotatedStart.x, cy + rotatedStart.y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.strokeStyle = route.color;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
          if (rotatedEnd.z >= 0) {
            ctx.beginPath();
            ctx.arc(cx + rotatedEnd.x, cy + rotatedEnd.y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.strokeStyle = route.color;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      });

      // Request next frame
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDragging, rotation]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    autoRotateRef.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    // Scale movement to rotation angle shifts
    const newY = rotation.y + dx * 0.01;
    const newX = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotation.x - dy * 0.01));
    
    setRotation({ x: newX, y: newY });
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Restart auto rotate after brief delay
    setTimeout(() => {
      autoRotateRef.current = true;
    }, 4000);
  };

  return (
    <div className="w-full text-white flex flex-col items-center select-none">
      {/* Small Header */}
      <div className="w-full flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-1.5">
          <Globe className="text-emerald-300 animate-pulse" size={13} />
          <span className="font-extrabold text-[10px] text-brand-100 uppercase tracking-widest">Supply Chain Routes</span>
        </div>
        <button 
          onClick={() => setRotation({ x: 0, y: 0 })}
          className="text-brand-300 hover:text-white transition p-1 rounded hover:bg-white/10"
          title="Reset View"
        >
          <RefreshCw size={11} />
        </button>
      </div>

      {/* Canvas for rendering the 3D globe */}
      <canvas
        ref={canvasRef}
        width="220"
        height="180"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="cursor-grab active:cursor-grabbing max-w-full"
      />

      {/* Routes Legend - styled dynamically to blend into banner */}
      <div className="w-full mt-3 space-y-1 text-[9px] font-bold text-brand-200">
        {routes.map((route, i) => (
          <div key={i} className="flex items-center justify-between bg-white/5 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-white/5">
            <span className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: route.color }} />
              {route.name}
            </span>
            <span className="text-emerald-400 font-extrabold text-[8px] uppercase tracking-wide">Live</span>
          </div>
        ))}
      </div>
    </div>
  );
}
