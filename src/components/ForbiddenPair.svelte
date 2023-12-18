<script lang="ts">
    let forbiddenPairs = [['jom', 'jo'], ['jo', 'nac'], ['jom', 'nac']];
</script>

<h1 class="pt-10 pb-5 text-4xl font-bold">Forbidden Pairs</h1>
<ol> <!-- TODO: grid is recommended here -->
    {#each forbiddenPairs as pair}
        <li class="text-xl py-3 flex justify-between items-center border rounded-xl my-4">
            <span class="px-5">{pair[0]}</span>
            <span class="px-5">{pair[1]}</span>
            <button class="bg-red-500 hover:bg-red-600 text-gray-800 py-1 px-3 mx-2 rounded-2xl cursor-pointer">remove</button>
        </li>
    {/each}
    <li class="text-xl py-3 flex justify-between border rounded-xl my-4">
        <input class="mx-2 p-2 rounded" placeholder="name1"/>
        <input class="mx-2 p-2 rounded" placeholder="name2"/>
        <button class="bg-red-500 hover:bg-red-600 text-gray-800 py-1 px-3 mx-2 rounded-2xl cursor-pointer">add</button>
    </li>
</ol>