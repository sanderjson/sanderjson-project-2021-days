<script>
	import { indexActiveHabit } from "../stores.js";
	import { push } from "svelte-spa-router";
	import HabitCard from "./HabitCard.svelte";
	import AppButton from "./AppButton.svelte";
	export let i;

	const handleTriggerNull = () => {
		indexActiveHabit.set(i);
	};

	const handleNullHabitAdd = () => {
		push("/add");
	};
</script>

<div class="flex flex-col">
	<button
		class:selected={$indexActiveHabit === i ||
			($indexActiveHabit === null && !habit.adminIsActive)}
		on:click={handleTriggerNull}
		class="bg-white py-1 px-2 border-2 border-blue-100 shadow rounded-sm
    hover:bg-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700
    focus:outline-none transition-colors duration-75"
	>
		<HabitCard duration={"Time"} code={"+"} leaders={false}>info</HabitCard>
	</button>

	<div>
		{#if $indexActiveHabit === i}
			<div class="sm:bg-white mt-2 sm:shadow sm:rounded-lg sm:px-6 sm:py-2">
				<AppButton handleFun={handleNullHabitAdd}>Add</AppButton>
			</div>
		{/if}
	</div>
</div>

<style>
	.selected {
		@apply bg-blue-100 bg-opacity-50;
	}
</style>
