# ECHO: MASK PROTOCOL

> _Un Roguelike Sónico creado para la Zulia Game Jam 2026._
> **Temática:** Máscaras.

---

## 👤 Autor

- **Desarrollador:** Marco Gomez
- **GitHub:** [marcogomez-dev](https://github.com/marcogomez-dev)
- **Discord:** nosshadow

---

## 🤖 Manifiesto: El Humano y la Máquina

Este proyecto es especial no solo por su mecánica, sino por su origen. **Es mi primera Game Jam.** Como desarrollador novato, me enfrenté a la barrera técnica habitual, pero también a una barrera cultural: el rechazo de parte de la comunidad hacia el uso de Inteligencia Artificial.

Entiendo el miedo, pero no comparto la limitación. Ver la IA como una barrera en lugar de una herramienta me parece incoherente; es como insistir en caminar pudiendo ir en coche, o conducir pudiendo volar. **ECHO: MASK PROTOCOL** es la prueba de que la IA no reemplaza la creatividad humana, la potencia.

Este juego fue construido en menos de 48 horas por una sola persona bajo una premisa de **Colaboración Simbiótica**:

- **Concepto y Dirección:** 100% Humano. La historia, las mecánicas, el diseño de niveles y la visión artística nacieron de mi imaginación.
- **Ejecución Técnica:** Asistida por IA.
  - **Código:** Escrito en colaboración con modelos avanzados (Claude 4.5 Opus y Sonnet, Gemini 3.0 Pro y Flash).
  - **Assets:** Generados y refinados con Gemini 3.0 Pro (Nano Bana Pro).
  - **Iteración:** El pulido, balanceo y debugging fue un trabajo conjunto de ida y vuelta.

Mi rol fue **dirigir, curar, ensamblar y validar** cada pieza de este rompecabezas. Este proyecto es una declaración de intenciones: las herramientas están para usarse, y permiten que alguien con ideas pero menos experiencia técnica pueda materializar mundos complejos.

---

## 📖 El Concepto

**ECHO** es un roguelike táctico por turnos donde **el sonido es tu único sentido**.

Estás atrapado en un mundo consumido por la oscuridad y el silencio eterno. No puedes ver las paredes, los caminos ni los monstruos... a menos que hagas ruido. Pero en este mundo de Silencio Absoluto, **hacer ruido los atrae...**.

Cada paso que das emite un "Pulso" que revela tu entorno pero también alerta a los enemigos cercanos. Debes navegar el mapa generado proceduralmente, mientras te encuentras con un idioma que parecen glifos antiguos y deberás recolectar las **Tres Máscaras de la Verdad** para escapar.

### 🎭 Las Máscaras (Integración de la Temática)

El juego gira en torno a las máscaras como identidad y percepción:

- **El Jugador:** Un viajero ciego buscando la verdad tras la máscara del silencio.
- **Los Enemigos:** Entidades sin rostro que cazan por sonido.
- **Los Artefactos:** Tres Máscaras (Amarilla, Azul, Roja) que revelan fragmentos de la historia perdida.

---

## 🎮 Mecánicas Principales

### 1. Sistema de Ecolocalización 📡

- **Movimiento es Visión:** La pantalla es negra. Al moverte, emites un pulso sónico.
- **Decaimiento Visual:** El "eco" rebota en las paredes, revelando el mapa brevemente antes de desvanecerse.
- **Riesgo vs. Recompensa:** Moverse rápido te deja ver más, pero genera un radio de ruido mayor que atrae enemigos desde más lejos.

### 2. IA Táctica Enemiga 🧠

Los enemigos son cazadores con reglas claras:

- **Sensibilidad al Sonido:** Rastrean tus pulsos. Si te quedas quieto, eres invisible.
- **Controles de Tanque:** Son pesados. Deben gastar un turno para **rotar 90°** antes de moverse. Esto crea una inercia predecible que puedes explotar para flanquearlos.
- **Colisión Masiva:** Tienen cuerpo físico. Si dos enemigos intentan ocupar el mismo espacio, chocan y quedan **Aturdidos** un turno. ¡Usa los pasillos estrechos para crear atascos!
- **Confusión:** Tienen una naturaleza caótica (20% de probabilidad) de tropezar o retroceder, abriendo brechas inesperadas en su formación.

### 3. El Sistema de Cifrado 🔣

La historia de Echo está escrita en una lengua muerta.

- **Glifos:** El mundo está lleno de mensajes en símbolos "desconocidos".
- **Desencriptación:** Al recolectar Máscaras, tu personaje adquiere memoria que te dirá más sobre este mundo.
- **Lore:** Desbloquear el texto completo en el nivel 10 revela el origen de este mundo y las criaturas que lo habitan.

### 4. Generación Procedural 🏙️

- **Algoritmo de Bloques Urbanos:** A diferencia de las cuevas orgánicas tradicionales que generan callejones sin salida, Echo usa un generador de "Manzanas de Ciudad".
- **Diseño Táctico:** Niveles con avenidas anchas (2-3 baldosas de ancho) y múltiples bucles, asegurando que siempre tengas rutas de escape y no quedes atrapado injustamente.
- **Dificultad Escalada:** Del nivel 1 al 9 aumenta el tamaño del mapa y la densidad de enemigos.
- **Niveles de historia hasta el 10:** Cada nivel revela más sobre el mundo y las criaturas que lo habitaban, al nivel 10, conocerás la historia completa de este mundo, aún así, podrás continuar explorando el mundo en niveles infinitos para puntuar en el score global.

---

## 💻 Stack Tecnológico

Construido con tecnologías web modernas, priorizando rendimiento y código limpio.

- **Motor:** ECS (Entity Component System) propio sobre HTML5 Canvas.
- **Framework:** [SvelteKit](https://kit.svelte.dev/) (Vite + Bun).
- **Lenguaje:** TypeScript (Strict Mode).
- **Algoritmos:**
  - Pathfinding A\* (Implementación personalizada de "Mejor Esfuerzo").
  - Generación Procedural de Bloques Urbanos.
- **Despliegue:** Cloudflare Pages / Wrangler.

---

## 🚀 Cómo Ejecutar

1.  Clonar el repositorio.
2.  Instalar dependencias:
    ```bash
    bun install
    ```
3.  Correr servidor de desarrollo:
    ```bash
    bun run dev
    ```
4.  Navegar a `http://localhost:5173`.

---

_Creado con ❤️, cafeína e IA para la Zulia Game Jam 2026._
