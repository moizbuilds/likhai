// Build + test configuration. Vite is the tool that runs the dev server,
// bundles the app for production, and (via Vitest) runs our unit tests.
// SvelteKit plugs into it here; the adapter decides how the built app is
// packaged for its host (adapter-auto detects Vercel by itself).
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
// CONCEPT: vitest/config re-exports Vite's defineConfig with the `test` field
// typed — importing from plain 'vite' makes TypeScript reject the test block.
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter()
		})
	],
	test: {
		// Unit tests live next to the code they test (src/**/*.test.ts).
		passWithNoTests: true
	}
});
