<script lang="ts">
	import { onDownload } from "$lib";
</script>

<button class="text-3xl bg-red-500 hover:bg-red-600 text-gray-800 font-bold py-6 px-6 rounded-2xl inline-flex items-center cursor-pointer" on:click={onDownload}>
    <svg class="fill-current w-6 h-6 mr-2 items-center" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
    <span>Download</span>
</button>