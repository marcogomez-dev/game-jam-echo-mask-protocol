<script lang="ts">
  import GlyphText from '../cipher/GlyphText.svelte';

  export let level: number = 1;
  export let enemyCount: number = 0;
  export let hasYellowMask: boolean = false;
  export let hasBlueMask: boolean = false;
  export let hasRedMask: boolean = false;
  export let noteRead: boolean = false;
</script>

<div class="game-header">
  <div class="header-content">
      <div class="section level">
          <GlyphText text="NIVEL" />
          <span class="value">{level}</span>
      </div>

      <div class="divider"></div>

      <div class="section enemies">
          <span class="icon enemy-icon">▲</span>
          <span class="x">x</span>
          <span class="value">{enemyCount}</span>
      </div>

      <div class="divider"></div>

      <div class="section masks">
          <!-- Yellow Mask (Vision) -->
          <div 
              class="mask-icon yellow" 
              class:active={hasYellowMask} 
          ></div>
          
          <!-- Blue Mask (Knowledge) -->
          <div 
              class="mask-icon blue" 
              class:active={hasBlueMask} 
          ></div>

          <!-- Red Mask (Path) -->
          <div 
              class="mask-icon red" 
              class:active={hasRedMask} 
          ></div>
      </div>

      <div class="divider"></div>

      <div class="section note">
          {#if noteRead}
              <div class="paper-icon active">
                  <div class="lines"></div>
              </div>
          {:else}
              <span class="note-icon">?</span>
          {/if}
      </div>
  </div>
</div>

<style>
  .game-header {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      min-width: 600px;
      padding: 5px;
      background: #000;
      border: 4px dashed #fff; 
      z-index: 50;
      font-family: monospace;
      color: #fff;
  }

  .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 0 20px;
      height: 40px;
  }

  .section {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.2rem;
      font-weight: bold;
  }

  .divider {
      width: 2px;
      height: 24px;
      background: #333;
  }

  /* Icons */
  .enemy-icon {
      color: #CC5500; /* Orange */
      font-size: 1.4rem;
  }

  .mask-icon {
      width: 28px;
      height: 28px;
      background-color: #444; 
      mask-image: url('/assets/simple_mask.png');
      -webkit-mask-image: url('/assets/simple_mask.png');
      mask-size: contain;
      -webkit-mask-size: contain;
      mask-repeat: no-repeat;
      -webkit-mask-repeat: no-repeat;
      mask-position: center;
      -webkit-mask-position: center;
      mask-mode: luminance;
      -webkit-mask-mode: luminance;
      opacity: 0.3; 
      transition: all 0.3s ease;
  }

  .mask-icon.active { opacity: 1; }
  .mask-icon.yellow.active { background-color: #FFD700; filter: drop-shadow(0 0 5px #FFD700); }
  .mask-icon.blue.active { background-color: #00FFFF; filter: drop-shadow(0 0 5px #00FFFF); }
  .mask-icon.red.active { background-color: #FF3333; filter: drop-shadow(0 0 5px #FF3333); }

  .paper-icon {
      width: 20px;
      height: 26px;
      background: #FFFFFF;
      position: relative;
      clip-path: polygon(0 0, 70% 0, 100% 30%, 100% 100%, 0 100%);
  }

  .paper-icon::after {
      content: '';
      position: absolute;
      top: 0; right: 0;
      width: 30%; height: 30%;
      background: #ccc;
      clip-path: polygon(0 0, 0 100%, 100% 100%);
  }

  .paper-icon .lines {
      position: absolute;
      top: 40%; left: 15%;
      width: 70%; height: 40%;
      border-top: 2px solid rgba(0,0,0,0.3);
      border-bottom: 2px solid rgba(0,0,0,0.3);
  }

  .paper-icon.active {
      filter: drop-shadow(0 0 5px #FFFFFF);
  }

  .note-icon {
      font-size: 1.8rem;
      color: #333; 
      transition: all 0.3s ease;
      font-weight: bold;
  }
</style>
