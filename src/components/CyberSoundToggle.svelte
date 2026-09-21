<script lang="ts">
  import { onMount } from 'svelte';
  import { isAudioMuted, toggleAudioMute, playToggleBeep } from '../lib/sound';

  let muted = $state(true);

  onMount(() => {
    muted = isAudioMuted();
  });

  function handleToggle() {
    muted = toggleAudioMute();
    if (!muted) {
      playToggleBeep(true);
    }
  }
</script>

<button
  type="button"
  class="cyber-sound-toggle {muted ? 'cyber-sound-toggle--muted' : 'cyber-sound-toggle--active'}"
  onclick={handleToggle}
  aria-label={muted ? "Enable cyber haptic audio effects" : "Mute cyber audio effects"}
  title={muted ? "Sound Effects: Muted (Click to Enable)" : "Sound Effects: Active (Click to Mute)"}
>
  <span class="wave-container" aria-hidden="true">
    <span class="wave-bar bar-1"></span>
    <span class="wave-bar bar-2"></span>
    <span class="wave-bar bar-3"></span>
  </span>
  <span class="toggle-label">{muted ? "SFX OFF" : "SFX ON"}</span>
</button>

<style>
  .cyber-sound-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.35rem 0.65rem;
    border-radius: var(--radius-pill);
    border: 1px solid var(--color-border);
    background: color-mix(in srgb, var(--color-surface-raised) 70%, transparent);
    backdrop-filter: blur(8px);
    color: var(--color-text-faint);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: all 180ms ease;
  }
  .cyber-sound-toggle:hover {
    border-color: var(--color-border-strong);
    color: var(--color-text);
  }
  .cyber-sound-toggle--active {
    border-color: rgba(0, 229, 255, 0.4);
    color: var(--neon-cyan);
    background: rgba(0, 229, 255, 0.08);
    box-shadow: 0 0 12px -2px rgba(0, 229, 255, 0.25);
  }
  .wave-container {
    display: inline-flex;
    align-items: flex-end;
    gap: 2px;
    height: 10px;
  }
  .wave-bar {
    width: 2px;
    border-radius: 1px;
    background: currentColor;
    transition: height 180ms ease;
  }
  .bar-1 { height: 4px; }
  .bar-2 { height: 8px; }
  .bar-3 { height: 5px; }

  .cyber-sound-toggle--active .bar-1 {
    animation: bounce-wave 1s infinite alternate ease-in-out;
  }
  .cyber-sound-toggle--active .bar-2 {
    animation: bounce-wave 0.8s infinite alternate 0.2s ease-in-out;
  }
  .cyber-sound-toggle--active .bar-3 {
    animation: bounce-wave 1.2s infinite alternate 0.4s ease-in-out;
  }

  @keyframes bounce-wave {
    0% { height: 3px; }
    100% { height: 10px; }
  }

  .cyber-sound-toggle--muted .wave-bar {
    height: 2px;
    opacity: 0.4;
  }
</style>
