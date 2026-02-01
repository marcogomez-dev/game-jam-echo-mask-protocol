<script>
  import { translate } from './glyphs';
  export let text = "";
  export let flicker = false;
  
  $: glyphs = translate(text);
</script>

<span class="glyph-text" class:flicker>{glyphs}</span>

<style>
  .glyph-text {
    font-family: 'Courier New', monospace;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  
  .flicker {
    animation: flicker 2s infinite;
  }
  
  @keyframes flicker {
     0% { opacity: 1; }
     5% { opacity: 0.8; }
     10% { opacity: 1; }
     15% { opacity: 0.3; }
     20% { opacity: 1; }
     100% { opacity: 1; }
  }
</style>
