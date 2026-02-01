<script lang="ts">
  import { onMount } from 'svelte';

  export let color: string; 

  let canvas: HTMLCanvasElement;

  onMount(() => {
     const img = new Image();
     img.src = '/assets/simple_mask.png';
     img.onload = () => {
         if (!canvas) return;
         const ctx = canvas.getContext('2d')!;
         
         // Use image natural size for high quality processing, then let CSS scale it display-wise.
         // Or set canvas to match image.
         canvas.width = img.width;
         canvas.height = img.height;
         
         // 1. Draw original
         ctx.drawImage(img, 0, 0);
         
         // 2. Remove Black Background
         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
         const data = imageData.data;
         
         for(let i=0; i < data.length; i+=4) {
             const r = data[i];
             const g = data[i+1];
             const b = data[i+2];
             
             // Black threshold < 50
             if(r < 50 && g < 50 && b < 50) {
                 data[i+3] = 0;
             } else {
                 data[i+3] = 255;
             }
         }
         ctx.putImageData(imageData, 0, 0);
         
         // 3. Tint (Source-In)
         ctx.globalCompositeOperation = 'source-in';
         ctx.fillStyle = color;
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         
         // Reset composite (good practice though we are done)
         ctx.globalCompositeOperation = 'source-over';
     };
  });
</script>

<canvas bind:this={canvas} class="mask-render"></canvas>

<style>
  .mask-render {
      width: 100%;
      height: 100%;
      object-fit: contain;
      /* Optional: Add drop shadow here if desired, or parent handles it */
  }
</style>
