<script>
	export let handleFun;
	export let success = false;
	export let danger = false;
</script>

{#if handleFun}
	<button
		on:click={handleFun}
		type="button"
		class="inline-flex justify-center w-full rounded-md border
    border-transparent shadow-sm px-4 py-2 bg-blue-900 text-base font-bold
    text-white hover:bg-blue-500 focus:outline-none focus:ring-2
    focus:ring-offset-2 focus:ring-blue-700 sm:text-sm transition-colors
    duration-75"
		class:success
		class:danger
	>
		<span><slot /></span>
	</button>
{:else}
	<button
		disabled
		class="inline-flex justify-center w-full rounded-md border
    border-transparent shadow-sm px-4 py-2 bg-blue-100 text-base font-bold
    text-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2
    focus:ring-blue-700 sm:text-sm transition-colors duration-75"
	>
		<span><slot /></span>
	</button>
{/if}

<style>
	.success {
		@apply bg-green-100 text-green-700 focus:ring-green-500 bg-opacity-50 hover:bg-green-500 hover:text-white;
	}

	.danger {
		@apply bg-red-100 text-red-700 focus:ring-red-500 bg-opacity-50 hover:bg-red-500 hover:text-white;
	}
</style>
