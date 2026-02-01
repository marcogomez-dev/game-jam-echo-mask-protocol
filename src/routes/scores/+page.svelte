<script lang="ts">
  import { onMount } from 'svelte';
  import GlyphText from '$lib/cipher/GlyphText.svelte';
  
  let scores: any[] = [];
  let loading = true;

  onMount(async () => {
    try {
        const res = await fetch('/api/scores');
        if (res.ok) {
            scores = await res.json();
        }
    } catch (e) {
        console.error("Error fetching scores", e);
    } finally {
        loading = false;
    }
  });

  function formatDate(dateString: string) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
      });
  }
</script>

<div class="container">
  <h1><GlyphText text="MEJORES JUGADORES DEL MUNDO" /></h1>
  
  <div class="table-frame">
     <table>
       <thead>
         <tr>
           <th>#</th>
           <th><GlyphText text="JUGADOR" /></th>
           <th><GlyphText text="NIVEL" /></th>
           <th><GlyphText text="FECHA" /></th>
         </tr>
       </thead>
       <tbody>
         {#each scores as score, i}
           <tr>
             <td>{i+1}</td>
             <td>{score.username}</td>
             <td>{score.level}</td>
             <td>{formatDate(score.date)}</td>
           </tr>
         {/each}
       </tbody>
     </table>
  </div>
  
  <a href="/" class="back-btn"><GlyphText text="REGRESAR" /></a>
</div>

<style>
  .container {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    color: white;
  }
  
  .table-frame {
     border: 2px solid white;
     padding: 1rem;
     width: 100%;
     max-width: 600px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  
  th, td {
    padding: 1rem;
    border-bottom: 1px solid #333;
  }
  
  th {
    font-size: 1.2rem;
    border-bottom: 2px solid white;
  }
  
  .back-btn {
    margin-top: 2rem;
    color: white;
    text-decoration: none;
    border: 1px solid white;
    padding: 0.5rem 2rem;
  }
  
  .back-btn:hover {
    background: white;
    color: black;
  }
</style>
