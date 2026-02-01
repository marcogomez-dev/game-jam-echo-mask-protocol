<script lang="ts">
  import { onMount } from 'svelte';
  import { Renderer } from './Renderer';
  import { gameState, type GameState } from '../stores/gameState';
  import { VisionSystem } from '../systems/Vision';
  import { MapGenerator } from '../systems/MapGenerator';
  import PauseMenu from '../ui/PauseMenu.svelte';

  import { messageStore } from '../stores/messageStore';
  import MessageDisplay from '../ui/MessageDisplay.svelte';
  import VictoryScreen from '../ui/VictoryScreen.svelte';
  import MobileControls from '../ui/MobileControls.svelte';

  let canvas: HTMLCanvasElement;
  let container: HTMLDivElement;
  let ctx: CanvasRenderingContext2D;
  let renderer: Renderer;
  let animationId: number;
  let isPaused = false;
  let activeMessage: any = null;
  let showingVictory = false;
  let isCheater = false;
  
  const unsubscribeMessage = messageStore.subscribe(m => {
      activeMessage = m;
  });

  const MAP_WIDTH = 45;
  const MAP_HEIGHT = 25;

  let state: GameState = MapGenerator.generate(MAP_WIDTH, MAP_HEIGHT, 1);
  $: gameState.set(state);

  onMount(() => {
    // Cheat Mode: ?cheatmode=algorithmogenpower[lvl:X]
    const params = new URLSearchParams(window.location.search);
    const cheat = params.get('cheatmode');
    if (cheat) {
        const match = cheat.match(/algorithmogenpower\[lvl:(\d+)\]/i);
        if (match) {
            const startLvl = parseInt(match[1]);
            if (startLvl > 0) {
                isCheater = true;
                state = MapGenerator.generate(MAP_WIDTH, MAP_HEIGHT, startLvl);
                // Unlock mandatory previous story notes
                for (let i = 0; i < startLvl - 1; i++) {
                    if (i < 10) state.player.foundStoryNotes[i] = true;
                }
                
                messageStore.show({
                    id: 'cheat-activated',
                    type: 'warning',
                    title: 'ANOMALÍA DETECTADA',
                    text: `Forzando entrada al Nivel ${startLvl}...`,
                    duration: 3000
                });
            }
        }
    }

    ctx = canvas.getContext('2d', { alpha: false })!;
    renderer = new Renderer(ctx, state.grid);
    
    const resizeObserver = new ResizeObserver(() => {
        resize();
    });
    resizeObserver.observe(container);
    resize();
    
    animationId = requestAnimationFrame(loop);
    
    window.addEventListener('keydown', handleKey);
    
    // Check start interactions (e.g. Level 1 Tutorial Note)
    checkInteractions();

    return () => {
        resizeObserver.disconnect();
        cancelAnimationFrame(animationId);
        window.removeEventListener('keydown', handleKey);
        unsubscribeMessage();
    };
  });

  let lastTime = 0;
  function loop(timestamp: number) {
     if (isPaused || activeMessage) { 
        animationId = requestAnimationFrame(loop);
        return;
     }

     const dt = timestamp - lastTime;
     lastTime = timestamp;
     
     if (dt < 1000) { 
        VisionSystem.update(state, dt);
     }
     
     draw();
     animationId = requestAnimationFrame(loop);
  }

  function handleKey(e: KeyboardEvent) {
    processInput(e.key);
  }

  function processInput(key: string) {
    if (activeMessage || showingVictory) {
        if (activeMessage && (key === 'Enter' || key === ' ')) {
            messageStore.dismiss();
        }
        return; 
    }

    if (key === ' ' && !activeMessage) {
       isPaused = !isPaused;
       return;
    }
    
    if (isPaused) return; 

    let dx = 0;
    let dy = 0;
    if (key === 'ArrowUp') dy = -1;
    if (key === 'ArrowDown') dy = 1;
    if (key === 'ArrowLeft') dx = -1;
    if (key === 'ArrowRight') dx = 1;

    if (dx !== 0 || dy !== 0) {
      const targetX = state.player.x + dx;
      const targetY = state.player.y + dy;
      
      if (targetX >= 0 && targetX < state.grid.width && targetY >= 0 && targetY < state.grid.height) {
        // Attempt move
        if (!state.cells[targetY][targetX].isWall) {
           state.player.x = targetX;
           state.player.y = targetY;
        }

        // Action always happens (even if bumped into wall)
        VisionSystem.triggerPulse(state);
        updateEnemies();
        checkInteractions();
        
        // Trigger reactivity for UI
        state = state;
      }
    }
  }

  function togglePause() {
     isPaused = !isPaused;
  }
  
  function handleQuit() {
      if (isCheater) {
          window.location.href = '/';
          return;
      }
      messageStore.show({
          type: 'score_upload',
          title: 'ABANDONO',
          data: { level: state.level }
      });
  }

  function checkInteractions() {
      const { player } = state;
      
      // 1. Mask Check
      const currentMask = state.masks.find(m => !m.collected && m.x === player.x && m.y === player.y);
      if (currentMask) {
          if (!currentMask.revealed) return;
          
          currentMask.collected = true;
          
          if (currentMask.type === 'YELLOW') {
              player.visionRadius = 6; 
              player.pulseDurationBonus = 1.0; 
              player.hasYellowMask = true;
              state.masks.forEach(m => { if (m.type === 'BLUE') m.revealed = true; });
              
              if (state.level === 1) {
                  messageStore.show({
                      id: 'mask-yellow',
                      type: 'gameplay',
                      title: 'Máscara de la Visión',
                      text: 'Veo más allá de la oscuridad...',
                      icon: 'yellow'
                  });
              }
          } 
          else if (currentMask.type === 'BLUE') {
              player.hasBlueMask = true;
              state.notes.forEach(n => n.revealed = true);
              
              if (state.level === 1) {
                  messageStore.show({
                      id: 'mask-blue',
                      type: 'gameplay',
                      title: 'Máscara del Conocimiento',
                      text: 'Tengo un vago recuerdo...',
                      icon: 'blue'
                  });
              }
          } 
          else if (currentMask.type === 'RED') {
              player.hasRedMask = true;
              if (state.exit) {
                  state.exit.open = true;
                  state.exit.revealed = true;
              }
              state.cells.forEach(row => row.forEach(c => c.visibility = 1.0));
              
              if (state.level === 1) {
                  messageStore.show({
                      id: 'mask-red',
                      type: 'gameplay',
                      title: 'Máscara del Camino',
                      text: 'El destino me llama...',
                      icon: 'red'
                  });
              }
          }
      }
      
      // 2. Note Check
      const note = state.notes.find(n => n.x === player.x && n.y === player.y);
      if (note) {
          if (!note.revealed) return; // Ignore hidden notes

          // Logic for first read actions
          if (!note.read) {
              note.read = true;
              
              // Level 1: Reading Tutorial Note reveals Yellow Mask
              if (state.level === 1 && note.id === 'tutorial-note') {
                   state.masks.forEach(m => { if (m.type === 'YELLOW') m.revealed = true; });
              }

              // Story Note: Reveal Red Mask
              if (note.id.startsWith('story-note')) {
                  state.masks.forEach(m => { if (m.type === 'RED') m.revealed = true; });
                  
                  // Mark as found in persistent state
                  if (state.level >= 1 && state.level <= 10) {
                      state.player.foundStoryNotes[state.level - 1] = true;
                      // Force new reference for reactivity
                      state.player.foundStoryNotes = [...state.player.foundStoryNotes];
                      state.player = { ...state.player };
                  }
              }
          }
          
          const isStory = note.id.startsWith('story-note');
          
          messageStore.show({
              id: note.id,
              type: isStory ? 'story' : 'tutorial',
              title: isStory ? 'Fragmento de Memoria' : 'Movimiento',
              text: note.text
          });
      }

      // 3. Exit Check
      if (state.exit && state.exit.open && state.exit.x === player.x && state.exit.y === player.y) {
          if (state.level === 10) {
              showingVictory = true;
          } else {
              messageStore.show({
                  id: 'level-complete',
                  type: 'success',
                  title: 'Nivel Completado',
                  text: 'Entrando al siguiente nivel...',
                  duration: 1500
              });
              setTimeout(nextLevel, 1500); 
          }
      }
  }

  function nextLevel() {
      const nextLvl = state.level + 1;
      const nextState = MapGenerator.generate(MAP_WIDTH, MAP_HEIGHT, nextLvl);
      

      nextState.player.foundStoryNotes = [...state.player.foundStoryNotes];
      // Vision resets to default (2) unless we want persistent power. 
      // Starting from scratch each level forces finding Yellow Mask again, which is good loop.
      
      state = nextState;
      
      // Resize new grid to current screen dimensions
      resize();

      if (renderer) {
          renderer.grid = state.grid;
      }
  }

  function resize() {
    if (!container || !canvas) return;
    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);

    state.grid.resize(width, height);
    draw(); 
  }
  
  function draw() {
     if (!renderer) return;
     const width = canvas.width / (window.devicePixelRatio || 1);
     const height = canvas.height / (window.devicePixelRatio || 1);
     
     renderer.clear(width, height);
     renderer.render(state);
  }

  function updateEnemies() {
       state.enemies.forEach(e => e.update(state));
       
       const hit = state.enemies.find(e => e.x === state.player.x && e.y === state.player.y);
       if (hit) {
          if (isCheater) {
              messageStore.show({
                  id: 'game-over',
                  type: 'warning',
                  title: 'SIMULACIÓN TERMINADA',
                  text: 'Modo prueba finalizado.\n\nRefresca para reiniciar.'
              });
          } else {
              messageStore.show({
                  type: 'score_upload',
                  title: 'MEMORIA BORRADA',
                  data: { level: state.level }
              });
          }
          isPaused = true;
       }
   }

</script>

<div class="canvas-container" bind:this={container}>
  <canvas 
      bind:this={canvas} 
      style="width: 100%; height: 100%; display: block;"
  ></canvas>
  
  <MessageDisplay />
  
  {#if isPaused && !activeMessage && !showingVictory}
    <PauseMenu onResume={togglePause} onQuit={handleQuit} />
  {/if}

  {#if showingVictory}
    <VictoryScreen 
        on:continue={() => { showingVictory = false; nextLevel(); }} 
        on:exit={handleQuit} 
    />
  {/if}

  <MobileControls on:input={(e) => processInput(e.detail.key)} />
</div>

<style>
  .canvas-container {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
  }
</style>
