<script lang="ts">
  import GlyphText from '$lib/cipher/GlyphText.svelte';
  import { gameState } from '$lib/stores/gameState';
  import { getStoryText } from '$lib/systems/StoryManager';
  import MaskIcon from './MaskIcon.svelte';
  
  export let onResume: () => void;
  export let onQuit: () => void;
  
  $: player = $gameState.player;
  $: currentLevel = $gameState.level || 1;

  function isUnlocked(index: number) {
      const levelNum = index + 1;
      // If we are past this level, it is unlocked automatically.
      // If we are AT this level, we check if found.
      return levelNum < currentLevel || player.foundStoryNotes[index];
  }
</script>


<div class="overlay">
  <div class="modal">
    <h1><GlyphText text="PAUSA" flicker={true} /></h1>
    
    <div class="content-grid">
        <!-- Section Level / Masks -->
        <div class="section masks-section">
            <h2><GlyphText text="CONSCIENCIA" /></h2>
            <div class="masks-list">
                <!-- Yellow -->
                <div class="mask-item yellow">
                    <div class="icon-container">
                         <MaskIcon color="#FFD700" />
                    </div>
                    <div class="info">
                        <div class="name">
                            <GlyphText text="Máscara de Visión" />
                        </div>
                        <div class="desc">
                            <GlyphText text="Aumenta el radio del pulso y la visión." />
                        </div>
                    </div>
                </div>
                <!-- Blue -->
                <div class="mask-item blue">
                    <div class="icon-container">
                        <MaskIcon color="#00FFFF" />
                    </div>
                    <div class="info">
                        <div class="name">
                            <GlyphText text="MÁSCARA DEL CONOCIMIENTO" />
                        </div>
                        <div class="desc">
                            <GlyphText text="Revela notas y secretos en el mapa." />
                        </div>
                    </div>
                </div>
                <!-- Red -->
                <div class="mask-item red">
                    <div class="icon-container">
                        <MaskIcon color="#FF3333" />
                    </div>
                    <div class="info">
                        <div class="name">
                            <GlyphText text="MÁSCARA DEL CAMINO" />
                        </div>
                        <div class="desc">
                            <GlyphText text="Revela la dirección de la salida." />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section Notes -->
        <div class="section notes-section">
            <h2><GlyphText text="MEMORIAS" /></h2>
            
            <div class="notes-layout">
                <!-- Column 1: Levels 1-5 -->
                <div class="notes-col">
                    {#each player.foundStoryNotes.slice(0, 5) as _, i}
                        {@const found = isUnlocked(i)}
                        <div class="note-card" class:locked={!found}>
                            <div class="note-header">
                                <GlyphText text="NIVEL"/> {i + 1}</div>
                            <div class="note-body">
                                <GlyphText text={found ? (getStoryText(i + 1).text || "MEMORIA") : "..."} />
                            </div>
                        </div>
                    {/each}
                </div>
                <!-- Column 2: Levels 6-10 -->
                <div class="notes-col">
                    {#each player.foundStoryNotes.slice(5, 10) as _, i}
                        {@const index = i + 5}
                        {@const found = isUnlocked(index)}
                        <div class="note-card" class:locked={!found}>
                            <div class="note-header">
                                <GlyphText text="NIVEL"/> {i + 1}</div>
                            <div class="note-body">
                                <GlyphText text={found ? (getStoryText(index + 1).text || "MEMORIA") : "..."} />
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <div class="buttons-row">
       <button on:click={onResume}>
          <GlyphText text="OK" />
       </button>
       
       <button class="quit" on:click={onQuit}>
          <GlyphText text="SALIR" />
       </button>
    </div>
  </div>
</div>

<style>
  .overlay {
     position: fixed;
     top: 0; left: 0; width: 100%; height: 100%;
     background: rgba(0,0,0,0.98);
     display: flex; justify-content: center; align-items: center;
     z-index: 200;
  }
  
  .modal {
     border: 2px solid white;
     padding: 2rem;
     text-align: center;
     display: flex; flex-direction: column; gap: 1.5rem;
     background: black;
     box-shadow: 0 0 50px rgba(255,255,255,0.1);
     width: 95%;
     max-width: 1200px;
     height: 90vh; 
     box-sizing: border-box;
     transition: all 0.3s ease;
  }

  /* Mobile Landscape Adjustments (or small screens) */
  @media (max-height: 500px) {
      .modal {
          padding: 1rem;
          gap: 0.5rem;
          height: 98vh;
      }
      h1 { font-size: 1.2rem; }
      .content-grid { gap: 0.5rem; }
      .section { padding: 0.5rem; gap: 0.5rem; }
      h2 { font-size: 0.8rem; }
      .buttons-row button { padding: 0.5rem 1rem; font-size: 0.9rem; min-width: 100px; }
  }
  
  h1 { 
      margin: 0; color: white; font-size: 2rem; letter-spacing: 0.5rem; 
      flex-shrink: 0;
  }
  
  .content-grid {
      display: grid;
      grid-template-columns: 1fr 2fr; /* Masks 33%, Notes 66% */
      gap: 1.5rem;
      flex-grow: 1;
      overflow: hidden; 
      text-align: left;
  }

  /* Break down columns on small width but landscape height */
  @media (max-width: 800px) {
      .content-grid {
          grid-template-columns: 1fr;
          overflow-y: auto;
      }
      .notes-layout {
          grid-template-columns: 1fr;
      }
  }

  .section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      border: 1px solid #333;
      padding: 1rem;
      background: #080808;
      overflow: hidden;
  }

  h2 {
      font-size: 1.1rem;
      color: #888;
      border-bottom: 1px solid #333;
      padding-bottom: 0.5rem;
      margin: 0;
      text-transform: uppercase;
  }

  /* Masks List */
  .masks-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex-grow: 1;
      justify-content: center;
  }

  .mask-item {
      display: flex;
      align-items: center;
      gap: 1.5rem; 
      padding: 0.8rem;
      border-radius: 4px;
      transition: background 0.3s;
      border-bottom: 1px solid #111;
  }

  /* Mobile masks sizing */
  @media (max-height: 500px) {
      .mask-item { padding: 0.3rem; gap: 0.8rem; }
      .icon-container { width: 35px !important; height: 35px !important; }
      .info .name { font-size: 0.8rem !important; margin: 0; }
      .info .desc { display: none; }
  }
  
  .mask-item:last-child { border-bottom: none; }
  
  .mask-item:hover {
      background: #111;
  }
  
  .icon-container {
      width: 60px;
      height: 60px;
      flex-shrink: 0;
  }
  
  /* Glows applied to the rendered canvas container */
  .mask-item.yellow .icon-container {
      filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.8));
  }
  .mask-item.blue .icon-container {
      filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.8));
  }
  .mask-item.red .icon-container {
      filter: drop-shadow(0 0 5px rgba(255, 51, 51, 0.8));
  }

  .info .name {
      color: #fff;
      font-weight: bold;
      font-size: 0.95rem;
      margin-bottom: 0.3rem;
  }
  .info .desc {
      font-size: 0.8rem;
      color: #999;
      line-height: 1.3;
  }
  
  .mask-item.yellow .name { color: #FFD700; }
  .mask-item.blue .name { color: #00FFFF; }
  .mask-item.red .name { color: #FF3333; }


  /* Notes Section */
  .notes-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      height: 100%;
      overflow: hidden;
  }
  
  .notes-col {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      height: 100%;
  }

  .note-card {
      background: #111;
      border: 1px solid #222;
      padding: 0.5rem 0.8rem;
      display: flex;
      flex-direction: column;
      flex: 1; /* Distribute space evenly */
      min-height: 70px; /* Ensure space for text */
      gap: 0.3rem;
  }

  /* Mobile notes scaling */
  @media (max-height: 500px) {
      .note-card { min-height: 40px; padding: 0.3rem 0.6rem; }
      .note-header { font-size: 0.7rem !important; }
      .note-body { font-size: 0.75rem !important; }
  }
  
  .note-card.locked {
      opacity: 0.3;
      border-style: dashed;
  }

  .note-header {
      color: #00FFFF;
      font-size: 0.8rem;
      font-weight: bold;
      border-bottom: 1px solid #333;
      padding-bottom: 0.2rem;
  }
  
  .note-card.locked .note-header {
      color: #555;
  }

  .note-body {
      font-size: 0.85rem;
      color: #fff;
      line-height: 1.3;
      overflow-y: auto;
      flex-grow: 1; /* Fill remaining card space */
  }
  
  /* Buttons */
  .buttons-row {
     display: flex; 
     gap: 1rem;
     justify-content: center;
     flex-shrink: 0;
  }
  
  button {
    background: transparent; border: 1px solid white; color: white;
    padding: 0.8rem 2rem;
    font-size: 1.1rem; cursor: pointer;
    font-family: monospace;
    transition: all 0.2s;
    min-width: 150px;
  }
  
  button:hover {
    background: white; color: black;
  }
  
  button.quit {
    border-color: #FF3333; color: #FF3333;
  }
  
  button.quit:hover {
    background: #FF3333; color: white;
  }
  
  /* Scrollbar */
  .note-body::-webkit-scrollbar { width: 4px; }
  .note-body::-webkit-scrollbar-thumb { background: #444; }
</style>
