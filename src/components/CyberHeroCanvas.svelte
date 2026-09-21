<script lang="ts">
  import { onMount } from "svelte";

  let canvasEl: HTMLCanvasElement | null = $state(null);
  let isVisible = $state(true);

  onMount(() => {
    if (!canvasEl) return;
    const canvas = canvasEl;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let animId = 0;

    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      baseAlpha: number;
    }

    let particles: Particle[] = [];
    const particleCount = 42;

    function resize() {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = canvas.width = rect?.width || window.innerWidth;
      height = canvas.height = rect?.height || 500;
      initParticles();
    }

    function initParticles() {
      particles = [];
      const isDark = document.documentElement.dataset.theme === "dark";
      const primaryColor = isDark ? "0, 229, 255" : "20, 24, 27";
      const secondaryColor = isDark ? "240, 68, 86" : "67, 77, 84";

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (prefersReducedMotion ? 0 : 0.45),
          vy: (Math.random() - 0.5) * (prefersReducedMotion ? 0 : 0.45),
          size: Math.random() * 2 + 1,
          color: Math.random() > 0.85 ? secondaryColor : primaryColor,
          baseAlpha: Math.random() * 0.4 + 0.2,
        });
      }
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    }

    function handleMouseLeave() {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    }

    const parent = canvas.parentElement;
    parent?.addEventListener("mousemove", handleMouseMove);
    parent?.addEventListener("mouseleave", handleMouseLeave);

    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(canvas);

    window.addEventListener("resize", resize);
    resize();

    function render() {
      if (!ctx || !isVisible || document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Spring mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      // Draw connecting lines
      const maxDistance = 120;
      const isDark = document.documentElement.dataset.theme === "dark";
      const lineColor = isDark ? "0, 229, 255" : "20, 24, 27";

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Cursor deflection interaction
        if (mouse.active) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const force = (140 - dist) / 140;
            p1.x += (dx / dist) * force * 1.8;
            p1.y += (dy / dist) * force * 1.8;
          }
        }

        // Particle movement
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0) p1.x = width;
        else if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        else if (p1.y > height) p1.y = 0;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p1.color}, ${p1.baseAlpha})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * (isDark ? 0.12 : 0.06);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    }

    if (!prefersReducedMotion) {
      animId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      parent?.removeEventListener("mousemove", handleMouseMove);
      parent?.removeEventListener("mouseleave", handleMouseLeave);
    };
  });
</script>

<canvas bind:this={canvasEl} class="cyber-canvas" aria-hidden="true"></canvas>

<style>
  .cyber-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0.85;
    mask-image: radial-gradient(circle at 50% 50%, black 40%, transparent 85%);
    -webkit-mask-image: radial-gradient(circle at 50% 50%, black 40%, transparent 85%);
  }

  @media (prefers-reduced-motion: reduce) {
    .cyber-canvas {
      display: none;
    }
  }
</style>
