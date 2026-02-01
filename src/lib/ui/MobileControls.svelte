<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import GlyphText from '../cipher/GlyphText.svelte';

  const dispatch = createEventDispatcher();

  function handlePress(key: string) {
    dispatch('input', { key });
  }
</script>

<div class="mobile-controls">
  <!-- Left Side: Pause -->
  <div class="left-pad">
    <button class="pause-btn" on:touchstart|preventDefault={() => handlePress(' ')}>
       <div class="p-circle">P</div>
    </button>
  </div>

  <!-- Right Side: D-PAD -->
  <div class="right-pad">
    <div class="dpad">
      <button class="up" on:touchstart|preventDefault={() => handlePress('ArrowUp')}>▲</button>
      <button class="left" on:touchstart|preventDefault={() => handlePress('ArrowLeft')}>◀</button>
      <button class="right" on:touchstart|preventDefault={() => handlePress('ArrowRight')}>▶</button>
      <button class="down" on:touchstart|preventDefault={() => handlePress('ArrowDown')}>▼</button>
    </div>
  </div>
</div>

<style>
  .mobile-controls {
    position: absolute;
    bottom: 5%;
    left: 0;
    right: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 0 -10%;
    pointer-events: none;
    z-index: 100;
  }

  /* Hidden on Desktop */
  @media (min-width: 1024px) {
    .mobile-controls {
      display: none;
    }
  }

  /* Show only if touch is available */
  @media (pointer: fine) {
    .mobile-controls {
        display: none;
    }
  }

  /* D-PAD ergonomics */
  .right-pad {
    margin-right: 5%;
  }

  /* Pause Button ergonomics */
  .left-pad {
    margin-left: 5%;  }

  button {
    pointer-events: auto;
    background: rgba(255, 255, 255, 0.02);
    -webkit-backdrop-filter: blur(5%);
    backdrop-filter: blur(5%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.1s;
    font-family: monospace;
  }

  button:active {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(0.9);
    box-shadow: 0 0 5% rgba(255, 255, 255, 0.2);
  }

  .pause-btn {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .p-circle {
    font-size: 2rem;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .dpad {
    display: grid;
    grid-template-areas: 
      ". up ."
      "left . right"
      ". down .";
    gap: 0%;
  }

  .up { grid-area: up; }
  .down { grid-area: down; }
  .left { grid-area: left; }
  .right { grid-area: right; }

  .dpad button {
    width: 3rem;
    height: 3rem;
    border-radius: 10px;
    font-size: 1.2rem;
  }
</style>
