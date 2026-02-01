<script>
  import GlyphText from '$lib/cipher/GlyphText.svelte';
</script>

<div class="menu">
  <div class="background"></div>
  
  <h1 class="title">
     <GlyphText text="ECHO" flicker={true} />
     <span class="subtitle"><GlyphText text="MASK PROTOCOL" /></span>
  </h1>
  
  <nav>
    <a href="/game" class="btn">
       <GlyphText text="JUGAR" />
    </a>
    <a href="/scores" class="btn">
       <GlyphText text="PUNTUACIONES" />
    </a>
  </nav>
</div>

<style>
  .menu {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start; /* Move up */
    padding-top: 15vh; /* Initial gap */
    gap: 4rem;
    position: relative;
    overflow: hidden;
    color: white; /* Ensure text is white */
  }
  
  .background {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: url('/assets/bg.png') no-repeat center center;
    background-size: contain;
    opacity: 0.1;
    z-index: -1;
  }
  
  .title {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 6rem;
    letter-spacing: 1rem;
    margin: 0;
    color: white; /* Explicit white */
  }
  
  .subtitle {
    font-size: 2rem;
    letter-spacing: 2rem;
    opacity: 0.7;
    margin-top: 1rem;
    color: white; /* Explicit white */
  }

  nav {
    display: flex;
    gap: 8rem;
    margin-top: 5rem; /* Push down towards eyes */
  }

  .btn {
    color: white;
    text-decoration: none;
    font-size: 2rem;
    border: 2px solid white;
    padding: 1rem 3rem;
    transition: all 0.3s ease;
    text-align: center;
    min-width: 200px;
  }
  
  .btn:hover {
    background: white;
    color: black;
    box-shadow: 0 0 20px white;
  }
</style>
