import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({ 
    plugins: [tailwindcss(), sveltekit()],
    server: {
		port: 3000,
		// open: true,
		// strictPort: true,
		host:"0.0.0.0",
	},
 });
