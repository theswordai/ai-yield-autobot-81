import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  trail: { x: number; y: number }[];
};

type Rocket = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
  trail: { x: number; y: number }[];
};

const COLORS = [
  "#FFD700", "#FF4D6D", "#FF8A3D", "#7CFFCB",
  "#5EA8FF", "#FFFFFF", "#FF6FD8", "#B388FF",
  "#FFE066", "#64FFDA",
];

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[(Math.random() * arr.length) | 0];

export default function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth * window.devicePixelRatio);
    let h = (canvas.height = window.innerHeight * window.devicePixelRatio);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const onResize = () => {
      w = canvas.width = window.innerWidth * window.devicePixelRatio;
      h = canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    window.addEventListener("resize", onResize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];

    const launch = (x?: number, y?: number) => {
      const sx = x ?? rand(W() * 0.15, W() * 0.85);
      const ty = y ?? rand(H() * 0.15, H() * 0.45);
      const startY = H() + 10;
      const dy = ty - startY;
      const vy = -Math.sqrt(2 * 0.18 * -dy); // physics-ish
      rockets.push({
        x: sx,
        y: startY,
        vx: rand(-0.4, 0.4),
        vy,
        targetY: ty,
        color: pick(COLORS),
        trail: [],
      });
    };

    const explode = (x: number, y: number, color: string) => {
      const count = 60 + ((Math.random() * 40) | 0);
      const ring = Math.random() < 0.35;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + rand(-0.05, 0.05);
        const speed = ring ? rand(3.2, 4.0) : rand(1.2, 4.5);
        const c = Math.random() < 0.25 ? pick(COLORS) : color;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: rand(60, 95),
          color: c,
          size: rand(1.6, 2.8),
          trail: [],
        });
      }
    };

    // Auto launch
    let last = performance.now();
    let nextLaunch = 0;
    let running = true;

    // initial burst
    launch(W() * 0.3, H() * 0.3);
    launch(W() * 0.7, H() * 0.35);
    setTimeout(() => launch(W() * 0.5, H() * 0.25), 300);

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(32, now - last) / 16.6667;
      last = now;

      // fade trail
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, W(), H());
      ctx.globalCompositeOperation = "lighter";

      // schedule launches
      nextLaunch -= dt * 16.6667;
      if (nextLaunch <= 0) {
        const n = 1 + ((Math.random() * 2) | 0);
        for (let i = 0; i < n; i++) setTimeout(() => launch(), i * 120);
        nextLaunch = rand(450, 900);
      }

      // rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 8) r.trail.shift();
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        r.vy += 0.09 * dt;

        // draw trail
        for (let t = 0; t < r.trail.length; t++) {
          const p = r.trail[t];
          const a = t / r.trail.length;
          ctx.beginPath();
          ctx.fillStyle = r.color;
          ctx.globalAlpha = a * 0.8;
          ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        // head
        ctx.beginPath();
        ctx.fillStyle = "#fff";
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 12;
        ctx.arc(r.x, r.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (r.vy >= 0 || r.y <= r.targetY) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 5) p.trail.shift();
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.045 * dt;
        p.vx *= Math.pow(0.985, dt);
        p.vy *= Math.pow(0.985, dt);
        p.life += dt;
        const lifeRatio = 1 - p.life / p.maxLife;

        if (lifeRatio <= 0) {
          particles.splice(i, 1);
          continue;
        }

        for (let t = 0; t < p.trail.length; t++) {
          const tp = p.trail[t];
          const a = (t / p.trail.length) * lifeRatio;
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = a * 0.7;
          ctx.arc(tp.x, tp.y, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.globalAlpha = Math.min(1, lifeRatio * 1.4);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;

      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);

    return () => {
      running = false;
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9998]"
      aria-hidden="true"
    />
  );
}
