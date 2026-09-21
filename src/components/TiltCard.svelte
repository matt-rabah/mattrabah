<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    href?: string;
    external?: boolean;
    class?: string;
    flat?: boolean;
    glowColor?: "cyan" | "crimson";
    children?: Snippet;
  }

  let {
    href,
    external = false,
    class: className = "",
    flat = false,
    glowColor = "cyan",
    children,
  }: Props = $props();

  let cardEl: HTMLElement | null = $state(null);
  let rotX = $state(0);
  let rotY = $state(0);
  let glareX = $state(50);
  let glareY = $state(50);
  let isHovered = $state(false);

  function handleMouseMove(e: MouseEvent) {
    if (!cardEl || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    const rect = cardEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Max 10deg rotation for sleek refined 3D feel
    const factor = 10;
    rotX = -((y - centerY) / centerY) * factor;
    rotY = ((x - centerX) / centerX) * factor;

    glareX = (x / rect.width) * 100;
    glareY = (y / rect.height) * 100;
  }

  function handleMouseEnter() {
    isHovered = true;
  }

  function handleMouseLeave() {
    isHovered = false;
    rotX = 0;
    rotY = 0;
    glareX = 50;
    glareY = 50;
  }
</script>

{#if href}
  <a
    bind:this={cardEl}
    {href}
    target={external ? "_blank" : undefined}
    rel={external ? "noopener noreferrer" : undefined}
    class="tilt-card {flat ? 'tilt-card--flat' : ''} {isHovered ? 'is-hovered' : ''} {className}"
    style="transform: perspective(1000px) rotateX({rotX}deg) rotateY({rotY}deg) {isHovered ? 'scale3d(1.018, 1.018, 1.018)' : 'scale3d(1, 1, 1)'};"
    onmousemove={handleMouseMove}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
  >
    <div
      class="glare-sheen glare-{glowColor}"
      style="background: radial-gradient(circle at {glareX}% {glareY}%, {glowColor === 'cyan' ? 'rgba(0, 229, 255, 0.16)' : 'rgba(240, 68, 86, 0.16)'} 0%, transparent 65%); opacity: {isHovered ? 1 : 0};"
      aria-hidden="true"
    ></div>
    <div class="card-content">
      {@render children?.()}
    </div>
  </a>
{:else}
  <article
    bind:this={cardEl}
    class="tilt-card {flat ? 'tilt-card--flat' : ''} {isHovered ? 'is-hovered' : ''} {className}"
    style="transform: perspective(1000px) rotateX({rotX}deg) rotateY({rotY}deg) {isHovered ? 'scale3d(1.018, 1.018, 1.018)' : 'scale3d(1, 1, 1)'};"
    onmousemove={handleMouseMove}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
  >
    <div
      class="glare-sheen glare-{glowColor}"
      style="background: radial-gradient(circle at {glareX}% {glareY}%, {glowColor === 'cyan' ? 'rgba(0, 229, 255, 0.16)' : 'rgba(240, 68, 86, 0.16)'} 0%, transparent 65%); opacity: {isHovered ? 1 : 0};"
      aria-hidden="true"
    ></div>
    <div class="card-content">
      {@render children?.()}
    </div>
  </article>
{/if}

<style>
  .tilt-card {
    position: relative;
    display: block;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    background: var(--color-surface-raised);
    color: inherit;
    text-decoration: none;
    overflow: hidden;
    transform-style: preserve-3d;
    box-shadow: var(--shadow-card);
    transition:
      transform 300ms var(--spring-smooth),
      border-color 220ms ease,
      box-shadow 300ms ease;
    will-change: transform;
    backdrop-filter: blur(12px);
  }

  .tilt-card:hover {
    border-color: var(--color-border-accent);
    box-shadow: var(--shadow-lift);
  }

  .tilt-card--flat {
    background: transparent;
    box-shadow: none;
  }

  .glare-sheen {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    transition: opacity 250ms ease;
  }

  .card-content {
    position: relative;
    z-index: 2;
    height: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    .tilt-card {
      transform: none !important;
      transition: none !important;
    }
  }
</style>
