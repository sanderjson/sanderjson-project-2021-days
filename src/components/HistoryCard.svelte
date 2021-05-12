<script>
	import HabitCard from "./HabitCard.svelte";
	import FaSquareCheck from "../svg/fa-square-check.svelte";
	import FaSquareClose from "../svg/fa-square-close.svelte";
	import { fade, fly } from "svelte/transition";
	export let habit;
	let showDetails = false;

	const presentCheckinDate = (data) => {
		const date = new Date(data);
		const time = date.toLocaleString("en-US", {
			hour: "numeric",
			minute: "numeric",
			hour12: true,
		});
		const dateString = `${date}`;
		return `${dateString.slice(0, 11)} at ${time}`;
	};
</script>

<div
	on:click={() => (showDetails = !showDetails)}
	class="mx-auto  py-1 border-2 border-blue-100 shadow rounded-sm bg-white
  hover:bg-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-900
  focus:outline-none transition-colors duration-75 cursor-pointer"
>
	<div class="flex">
		<div class="w-1/3 py-1 px-2 ">
			<HabitCard
				duration={habit.detailDuration}
				code={habit.detailCode}
				leaders={false}
			>
				{#if habit.reflectIsSuccessful}
					<span class="bg-green-100 text-green-700 py-1 px-2 rounded-sm">
						success
					</span>
				{:else if habit.reflectIsSuccessful == null}
					<span class="bg-blue-100 text-blue-700 px-2 rounded-sm">active</span>
				{:else}
					<span class="bg-red-100 text-red-700 px-2 rounded-sm">fail</span>
				{/if}
			</HabitCard>
		</div>
		<div class="w-full">
			<div
				class="ml-2 pl-2 pt-3 text-xs font-extrabold text-gray-900 uppercase
      text-left"
			>
				{habit.detailTitle}
			</div>
			<div
				class="ml-2 pl-2 pt-0 text-xs font-extrabold text-gray-500 uppercase
      text-left"
			>
				Start: {habit.adminDateEndUTCString.slice(0, 16)}
			</div>
			<div
				class="ml-2 pl-2 text-xs font-extrabold text-gray-500 uppercase text-left"
			>
				End: {habit.adminDateStartUTCString.slice(0, 16)}
			</div>
			<ul
				class="ml-2 pt-1 place-items-center grid grid-cols-8 w-4/5 leading-tight"
			>
				{#each habit.checks as check, i}
					{#if i < 15}
						<li title={check.date.slice(0, 16)}>
							{#if check.isOk}
								<span class="inline-block text-green-500 w-5 h-5 fill-current">
									<FaSquareCheck />
								</span>
							{:else}
								<span class="inline-block text-red-500 w-6 h-6 fill-current">
									<FaSquareClose />
								</span>
							{/if}
						</li>
					{/if}
					{#if i === 15}
						<div
							class="w-full text-xs font-extrabold text-gray-900 uppercase
            text-center"
						>
							...
						</div>
					{/if}
				{/each}
			</ul>
		</div>
	</div>
	{#if showDetails}
		<div>
			<ul class="pl-4 grid grid-cols-2">
				{#each habit.checks as check, i}
					<li in:fade={{ delay: 50 * i }} class="mt-1 flex space-x-2">
						{#if check.isOk}
							<span class="inline-block text-green-500 w-5 h-5 fill-current">
								<FaSquareCheck />
							</span>
						{:else}
							<span class="inline-block text-red-500 w-6 h-6 fill-current">
								<FaSquareClose />
							</span>
						{/if}
						<span
							class="inline-block text-base font-bold text-gray-700 uppercase"
						>
							{presentCheckinDate(check.date)}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
