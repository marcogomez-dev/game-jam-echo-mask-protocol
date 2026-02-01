import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { getPlatformProxy } from "wrangler";

export default defineConfig(async () => {
  const proxy = await getPlatformProxy();
  return {
    plugins: [sveltekit()],
    server: {
      port: 5173,
    },
    define: {
      // This makes key bindings available in the global scope if needed,
      // though SvelteKit usually passes them via event.platform
    },
  };
});
