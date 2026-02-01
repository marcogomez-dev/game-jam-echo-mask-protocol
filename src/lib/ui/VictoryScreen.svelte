<script lang="ts">
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import GlyphText from '../cipher/GlyphText.svelte';

  const dispatch = createEventDispatcher();
  let showHistory = false;

  function onContinue() {
      dispatch('continue');
  }

  function onExit() {
      dispatch('exit');
  }

  function toggleHistory() {
      showHistory = !showHistory;
  }
</script>

<div class="victory-overlay" transition:fade={{ duration: 500 }}>
  <div class="victory-modal">
      <div class="header">
          <h1 class="title">
              <GlyphText text="ECO TRASCENDIDO" />
          </h1>
          <p class="description">
              <GlyphText text="Has superado el umbral. El ciclo te espera." />
          </p>
      </div>
      
      <!-- Flip Container -->
      <div class="visual-area">
          <div class="card-inner" class:flipped={showHistory}>
              <!-- Front: Art -->
              <div class="face front">
                  <img src="/assets/art.png" alt="Victory Art" />
              </div>

              <!-- Back: Story -->
              <div class="face back">
                  <div class="story-content">
                      <h3 class="story-title"><GlyphText text="LIMBO DE LAS FORMAS" /></h3>
                      <p><GlyphText text="Eras un eco en un vacío voraz, negándote a ser olvidado por la nada." /></p>
                      
                      <p><GlyphText text="Las sombras que enfrentaste eran ecos del pasado, ideas rotas que nunca lograron trascender, consumidos por la envidia de tu existencia." /></p>
                      
                      <p><GlyphText text="Las máscaras que encontraste forjaron tu identidad: Curiosidad, Voluntad y Destino." /></p>
                      
                      <div class="separator"></div>
                      
                      <p class="revelation">
                          <GlyphText text="No escapaste, trascendiste." />
                          <br>
                          <GlyphText text="Te has convertido en arte." />
                      </p>
                  </div>
              </div>
          </div>
      </div>

      <div class="actions">
          <button class="btn continue" on:click={onContinue}>
              <GlyphText text="OK" />
          </button>
          
          <button class="btn history" on:click={toggleHistory}>
              <GlyphText text={showHistory ? "ARTE" : "HISTORIA"} />
          </button>
          
          <button class="btn exit" on:click={onExit}>
              <GlyphText text="SALIR" />
          </button>
      </div>
  </div>
</div>

<style>
  .victory-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
  }

  .victory-modal {
      width: auto;
      max-width: 95vw;
      height: auto;
      max-height: 95vh;
      
      background: #000;
      border: 2px solid #fff;
      box-shadow: 0 0 50px rgba(0, 255, 255, 0.2);
      
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      box-sizing: border-box;
      text-align: center;
      font-family: monospace;
      color: #fff;
  }

  .header {
      flex-shrink: 0;
      margin-bottom: 1rem;
      width: 100%;
  }

  .title {
      font-size: 2rem;
      color: #00FFFF;
      text-transform: uppercase;
      letter-spacing: 4px;
      text-shadow: 0 0 10px #00FFFF;
      margin: 0 0 0.5rem 0;
  }

  .description {
      font-size: 1rem;
      color: #ddd;
      margin: 0;
  }

  /* 3D Flip Styling */
  .visual-area {
      flex-shrink: 1;
      margin: 0.5rem 0;
      perspective: 1000px;
      display: flex;
      justify-content: center;
      align-items: center;
  }

  .card-inner {
      position: relative;
      /* width/height auto, sized by relative front */
      text-align: center;
      transition: transform 0.8s;
      transform-style: preserve-3d;
      display: flex;
      justify-content: center;
      align-items: center;
  }

  .card-inner.flipped {
      transform: rotateY(180deg);
  }

  .face {
      backface-visibility: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      background: #050505;
      border: 1px solid #333;
  }

  .front {
      position: relative; /* In flow, dictates size */
      z-index: 2;
  }

  .front img {
      max-height: 60vh;
      width: auto;
      max-width: 100%;
      display: block;
  }

  .back {
      position: absolute; /* Matches front size */
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      
      transform: rotateY(180deg);
      background: #111;
      padding: 2rem;
      box-sizing: border-box;
      border: 1px solid #00FFFF;
      overflow-y: auto; /* Scroll if text is long */
  }

  .story-content {
      text-align: left;
      font-size: 1rem;
      line-height: 1.5;
      color: #ccc;
      max-width: 600px;
  }

  .story-title {
      color: #FFD700;
      border-bottom: 1px solid #444;
      padding-bottom: 0.2rem;
      margin: 1.5rem 0 0.5rem 0;
      font-size: 1.1rem;
      text-transform: uppercase;
  }
  
  .story-title:first-child {
      margin-top: 0;
  }

  .separator {
      height: 1px;
      background: #00FFFF;
      margin: 2rem 0;
      opacity: 0.5;
  }

  .revelation {
      text-align: center;
      color: #00FFFF;
      font-size: 1.2rem;
      font-weight: bold;
      text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  }

  .actions {
      flex-shrink: 0;
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      margin-top: 1rem;
      width: 100%;
  }

  .btn {
      padding: 1rem 1.5rem;
      font-family: inherit;
      font-size: 1.1rem;
      font-weight: bold;
      text-transform: uppercase;
      cursor: pointer;
      border: 2px solid;
      background: transparent;
      transition: all 0.3s ease;
      min-width: 140px;
  }

  .btn.continue {
      border-color: #00FFFF;
      color: #00FFFF;
  }
  .btn.continue:hover {
      background: #00FFFF;
      color: #000;
  }

  .btn.history {
      border-color: #FFD700;
      color: #FFD700;
  }
  .btn.history:hover {
      background: #FFD700;
      color: #000;
      box-shadow: 0 0 15px #FFD700;
  }

  .btn.exit {
      border-color: #FF3333;
      color: #FF3333;
  }
  .btn.exit:hover {
      background: #FF3333;
      color: #000;
  }
</style>
