<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { messageStore } from '../stores/messageStore';
  import GlyphText from '../cipher/GlyphText.svelte'; 
  import KeyboardTutorial from './KeyboardTutorial.svelte';
  import { onDestroy } from 'svelte';

  let message: any = null;
  let username: string = "";
  let isUploading = false;

  const unsubscribe = messageStore.subscribe(value => {
      if (value !== message) username = ""; // Reset on new message
      message = value;
  });

  onDestroy(() => {
      unsubscribe();
  });

  async function handleUpload() {
      if (!username.trim() || isUploading) return;
      isUploading = true;

      try {
          const response = await fetch('/api/scores', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  username: username.trim(),
                  level: message.data.level
              })
          });

          if (response.ok) {
              messageStore.dismiss();
              window.location.href = '/'; // Go back to menu after success
          }
      } catch (e) {
          console.error("Score upload failed:", e);
      } finally {
          isUploading = false;
      }
  }

  function close() {
      const type = message?.type;
      messageStore.dismiss();
      if (type === 'score_upload') {
          window.location.href = '/'; // Go back to menu if they close without saving
      }
  }
</script>

{#if message}
  <div class="overlay" transition:fade={{ duration: 200 }}>
      <div 
         class="modal {message.type}"
         transition:fly={{ y: 20, duration: 300 }}
      >
          {#if message.title}
            <h2 class="title">
                <GlyphText text={message.title} />
            </h2>
          {/if}
          
          <div class="content">
             {#if message.type === 'masks_summary'}
                 <div class="summary-list">
                    <div class="summary-item" class:locked={!message.data.hasYellowMask}>
                        <img src="/assets/mask_yellow.png" alt="Yellow" class="icon" />
                        <div class="info">
                            <div class="name"><GlyphText text={message.data.hasYellowMask ? "Máscara de Visión" : "SIN OBTENER"} /></div>
                            <div class="desc"><GlyphText text={message.data.hasYellowMask ? "Aporta mayor visión." : "..."} /></div>
                        </div>
                    </div>
                    <div class="summary-item" class:locked={!message.data.hasBlueMask}>
                        <img src="/assets/mask_blue.png" alt="Blue" class="icon" />
                        <div class="info">
                            <div class="name"><GlyphText text={message.data.hasBlueMask ? "MÁSCARA DEL CONOCIMIENTO" : "SIN OBTENER"} /></div>
                            <div class="desc"><GlyphText text={message.data.hasBlueMask ? "Revela secretos ocultos." : "..."} /></div>
                        </div>
                    </div>
                    <div class="summary-item" class:locked={!message.data.hasRedMask}>
                        <img src="/assets/mask_red.png" alt="Red" class="icon" />
                        <div class="info">
                            <div class="name"><GlyphText text={message.data.hasRedMask ? "MÁSCARA DEL CAMINO" : "SIN OBTENER"} /></div>
                            <div class="desc"><GlyphText text={message.data.hasRedMask ? "Muestra el camino a la salida." : "..."} /></div>
                        </div>
                    </div>
                 </div>
             {:else if message.type === 'notes_summary'}
                 <div class="summary-list scrollable">
                     {#each message.data.notes as note, i}
                         <div class="summary-item small" class:locked={note === '???'}>
                             <div class="level-indicator">
                                 <GlyphText text={`${i + 1}`} />
                             </div>
                             <div class="info">
                                 <div class="desc"><GlyphText text={note} /></div>
                             </div>
                         </div>
                     {/each}
                 </div>
             {:else if message.type === 'score_upload'}
                 <div class="score-form">
                     <p><GlyphText text={`CAPA ALCANZADA: ${message.data.level}`} /></p>
                     <input 
                         type="text" 
                         bind:value={username} 
                         placeholder="NOMBRE DE USUARIO"
                         maxlength="15"
                         disabled={isUploading}
                     />
                     <button 
                         class="upload-btn" 
                         on:click={handleUpload}
                         disabled={!username.trim() || isUploading}
                     >
                         <GlyphText text={isUploading ? "SUBIENDO..." : "SUBIR PUNTUACIÓN"} />
                     </button>
                 </div>
             {:else}
                 {#if message.text}
                    <GlyphText text={message.text} />
                 {/if}
                 {#if message.id === 'tutorial-note'}
                     <KeyboardTutorial />
                 {/if}
             {/if}
          </div>

          {#if !message.duration}
              <button class="close-btn" on:click={close}>
                     <GlyphText text="Continuar" />
              </button>
          {/if}
      </div>
  </div>
{/if}

<style>
  .overlay {
      position: fixed;
      top: 0; 
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
  }

  .modal {
      background: #000;
      border: 2px solid #fff;
      padding: 2.2rem;
      max-width: 90%;
      width: 420px;
      text-align: center;
      box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
      font-family: monospace; 
      color: #fff;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
  }

  .title {
      font-size: 1.5rem;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #fff;
  }
  
  .content {
      font-size: 1rem;
      line-height: 1.6;
      white-space: pre-wrap;
  }

  .close-btn {
      background: #fff;
      color: #000;
      border: none;
      padding: 0.8rem 2rem;
      font-family: monospace;
      font-weight: bold;
      cursor: pointer;
      text-transform: uppercase;
      align-self: center;
      transition: all 0.2s;
  }
  
  .close-btn:hover {
      background: #ccc;
      transform: scale(1.05);
  }

  /* Type variants */
  .modal.story {
      border-color: #00FFFF;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
  }
  .modal.story .title, .modal.story .close-btn { color: #00FFFF; }
  .modal.story .close-btn { background: transparent; border: 1px solid #00FFFF; }

  .modal.gameplay { border-color: #FFD700; width: 300px; }
  .modal.warning { border-color: #FF3333; }
  .modal.warning .title { color: #FF3333; }

  /* Summary styles */
  .summary-list { display: flex; flex-direction: column; gap: 1rem; text-align: left; width: 100%; }
  .summary-list.scrollable { max-height: 300px; overflow-y: auto; padding-right: 0.5rem; }
  .summary-item { display: flex; align-items: center; gap: 1rem; padding: 0.5rem; border-bottom: 1px solid #333; }
  .summary-item.locked { opacity: 0.5; }
  .icon { width: 40px; height: 40px; object-fit: contain; }
  .name { color: #00FFFF; font-weight: bold; text-transform: uppercase; font-size: 0.9rem; margin-bottom: 0.2rem; }
  .desc { font-size: 0.8rem; color: #ccc; }
  
  /* Form */
  .score-form { display: flex; flex-direction: column; gap: 1.2rem; align-items: center; width: 100%; }
  .score-form input {
      background: #0a0a0a;
      border: 1px solid #333;
      color: #fff;
      padding: 1rem;
      width: 100%;
      text-align: center;
      font-family: monospace;
      font-size: 1.1rem;
      outline: none;
  }
  .score-form input:focus { border-color: #00FFFF; }
  .upload-btn {
      background: transparent;
      border: 2px solid #00FFFF;
      color: #00FFFF;
      padding: 1rem;
      cursor: pointer;
      font-weight: bold;
      width: 100%;
      transition: all 0.2s;
      font-family: monospace;
  }
  .upload-btn:hover:not(:disabled) { background: rgba(0, 255, 255, 0.1); }
  .upload-btn:disabled { opacity: 0.3; cursor: not-allowed; }
</style>
