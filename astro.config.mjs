import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

import node from "@astrojs/node";
import 'dotenv/config'

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  redirects: {
    '/app': '/app/dashboard',
  },
  // server: {
  //   fs: {
  //     // Allow serving files from one level up to the project root
  //     allow: ['..'],
  //   },
  // },
});