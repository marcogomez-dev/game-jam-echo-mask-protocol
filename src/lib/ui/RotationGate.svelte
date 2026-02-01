<script lang="ts">
  import GlyphText from '$lib/cipher/GlyphText.svelte';
</script>

<div class="rotation-overlay">
  <div class="rotation-warning">
      <div class="phone-icon">📱</div>
      <GlyphText text="GIRA EL DISPOSITIVO" />
  </div>
</div>

<style>
  .rotation-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000;
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    color: white;
  }

  .rotation-warning {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    text-align: center;
  }

  .phone-icon {
    font-size: 5rem;
    animation: rotate-phone 2s infinite ease-in-out;
  }

  @keyframes rotate-phone {
    0% { transform: rotate(0deg); }
    50% { transform: rotate(90deg); }
    100% { transform: rotate(0deg); }
  }

  /* Only show warning on small screens in portrait */
  @media (max-width: 900px) and (orientation: portrait) {
    .rotation-overlay {
      display: flex;
    }
  }
</style>
