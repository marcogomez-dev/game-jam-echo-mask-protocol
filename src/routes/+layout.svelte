<script lang="ts">
    import RotationGate from '$lib/ui/RotationGate.svelte';
    import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/assets/simple_mask.png" />
</svelte:head>

<RotationGate />

{@render children()}
