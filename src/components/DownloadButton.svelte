<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let group_cnt: number;
	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('click');
	}
</script>

<button
	class="text-3xl bg-orange-primary hover:bg-orange-primary-darken text-white-secondary transition-all font-bold py-6 px-6 rounded-2xl inline-flex justify-center items-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none font-scaryHalloween"
	on:click={handleClick}
	aria-label="Download"
	disabled={group_cnt === 0}
>
	<svg
		class="fill-current w-6 h-6 mr-2 items-center"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" /></svg
	>
	<span>Generate</span>
</button>
