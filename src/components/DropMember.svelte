<script lang="ts">
	import { onDrop } from '$lib';
    import DropFile from 'svelte-parts/DropFile.svelte'
</script>

<!-- TODO: weird bug with DropFile -->
<DropFile onDrop={onDrop}>
    <!-- <div class="text-3xl bg-red-500 hover:bg-red-600 text-gray-800 font-bold py-6 px-6 rounded-2xl inline-flex items-center cursor-pointer">
        <svg class="h-6 w-6 mr-2 text-gray-800" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M7 18a4.6 4.4 0 0 1 0 -9h0a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1" />  <polyline points="9 15 12 12 15 15" />  <line x1="12" y1="12" x2="12" y2="21" /></svg>
        <span class="font-bold text-3xl text-gray-800">Upload file</span>
    </div> -->
</DropFile>