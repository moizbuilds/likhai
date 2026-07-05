<script lang="ts">
	// Root layout: wraps every page of the app. Fonts and global styles load
	// once here instead of per-page.
	// CONCEPT: layout — SvelteKit renders this file around every route;
	// {@render children()} is the hole the current page fills.
	import '@fontsource/noto-nastaliq-urdu';
	import '@fontsource/bricolage-grotesque/400.css';
	import '@fontsource/bricolage-grotesque/700.css';
	import '@fontsource/bungee';
	import '$lib/styles/tokens.css';
	import favicon from '$lib/assets/favicon.svg';

	// CONCEPT: props — inputs a component receives from its parent; in Svelte 5
	// they arrive via the $props() rune. Here the only prop is the page itself.
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
