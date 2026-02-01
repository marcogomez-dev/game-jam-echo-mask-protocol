<script lang="ts">
  import GlyphText from '$lib/cipher/GlyphText.svelte';
  
  export let level = 1;
  export let onRestart: () => void;
  export let onSubmit: (name: string) => void;
  
  let username = '';
  
  function handleSubmit() {
    if (username.trim()) {
      onSubmit(username);
    }
  }
</script>

<div class="overlay">
  <div class="modal">
    <h1><GlyphText text="FIN DEL JUEGO" flicker={true} /></h1>
    
    <div class="stats">
      <p><GlyphText text="NIVEL ALCANZADO" />: {level}</p>
    </div>
    
    <div class="form">
       <label for="name"><GlyphText text="INGRESA TU NOMBRE" /></label>
       <input id="name" type="text" bind:value={username} maxlength="30" placeholder="NAME" />
       
       <button on:click={handleSubmit} disabled={!username}>
          <GlyphText text="ENVIAR" />
       </button>
    </div>
    
    <button class="restart" on:click={onRestart}>
      <GlyphText text="REINICIAR" />
    </button>
  </div>
</div>

<style>
  .overlay {
     position: fixed;
     top: 0; left: 0; width: 100%; height: 100%;
     background: rgba(0,0,0,0.9);
     display: flex; justify-content: center; align-items: center;
     z-index: 100;
  }
  
  .modal {
     border: 2px solid white;
     padding: 3rem;
     text-align: center;
     display: flex; flex-direction: column; gap: 2rem;
     background: black;
     box-shadow: 0 0 30px rgba(255,255,255,0.2);
  }
  
  h1 { margin: 0; color: red; font-size: 3rem; }
  
  input {
     background: transparent;
     border: 1px solid white;
     color: white;
     padding: 0.5rem;
     font-size: 1.2rem;
     text-align: center;
     margin: 1rem 0;
     display: block; width: 100%;
     font-family: inherit;
  }
  
  button {
    background: white; border: none; color: black; padding: 1rem;
    font-size: 1.2rem; cursor: pointer;
    font-family: monospace;
  }
  
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  
  button.restart {
    background: transparent; color: white; border: 1px solid white;
  }
  
  button.restart:hover { background: white; color: black; }
</style>
