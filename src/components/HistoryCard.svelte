<script>
	import HabitCard from "./HabitCard.svelte";
	import FaSquareCheck from "../svg/fa-square-check.svelte";
	import FaSquareClose from "../svg/fa-square-close.svelte";
	import { fade, fly } from "svelte/transition";
	export let habit;
	let showDetails = false;

	const presentCheckinDate = (data) => {
		const date = new Date(data);

		const time = date
			.toLocaleString("en-US", {
				hour: "numeric",
				minute: "numeric",
				hour12: true,
			})
			.toString();
		// .slice(1, 5);

		const day = new Intl.DateTimeFormat("en-CA", { weekday: "short" })
			.format(date)
			.toString()
			.slice(0, -1);

		const string = date.toLocaleDateString();

		return time + " " + day + " " + string;
	};

	const presentCheckinSummary = (data) => {
		let numOK = 0;
		let numNotOK = 0;

		for (const check of data) {
			if (check.isOk) {
				numOK++;
			} else {
				numNotOK++;
			}
		}

		return {
			total: numOK + numNotOK,
			numOK: numOK,
			numNotOK: numNotOK,
		};
	};

	console.log(habit.checks);
	const checkinSummary = presentCheckinSummary(habit.checks);
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
				<div class="mt-1">
					{#if habit.reflectIsSuccessful}
						<span class="bg-green-100 text-green-700 py-1 px-2 rounded-sm">
							success
						</span>
					{:else if habit.reflectIsSuccessful == null}
						<span class="bg-blue-100 text-blue-700 px-2 rounded-sm">active</span
						>
					{:else}
						<span class="bg-red-100 text-red-700 px-2 rounded-sm">fail</span>
					{/if}
				</div>
			</HabitCard>
		</div>

		<section class="w-full">
			<div class="ml-2 pl-2  text-xs font-extrabold uppercase">
				<div class="pt-3 text-gray-900 text-base">
					{habit.detailTitle}
				</div>
				<div class="text-gray-500">
					Start: {habit.adminDateEndUTCString.slice(0, 16)}
				</div>
				<div class="text-gray-500 ">
					End: {habit.adminDateStartUTCString.slice(0, 16)}
				</div>
			</div>
			<ul
				class="ml-2 pl-1 pt-1 place-items-center grid grid-cols-8 w-4/5 leading-tight"
			>
				{#each habit.checks as check, i}
					{#if i < 15}
						<li title={check.date.slice(0, 16)}>
							{#if check.isOk}
								<span class="inline-block text-green-500 w-5 h-5 fill-current">
									<FaSquareCheck />
								</span>
							{:else}
								<span class="inline-block text-red-500 w-5 h-5 fill-current">
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
		</section>
	</div>

	{#if showDetails}
		<section class="mt-2 sm:mt-4">
			<div
				class="bg-blue-100 p-4 text-gray-900 text-lg font-extrabold uppercase text-center underline"
			>
				{checkinSummary.total} Habit Checks ({checkinSummary.numOK} OK)
			</div>
		</section>
		<section class="mt-2 sm:mt-4">
			<ul class="pl-2 grid grid-cols-2 sm:pl-4">
				{#each habit.checks as check, i}
					<li
						in:fade={{ delay: 50 * i }}
						class="mt-1 flex space-x-1 sm:space-x-2"
					>
						{#if check.isOk}
							<span
								class="inline-block text-green-500 w-4 h-4 sm:w-5 sm:h-5 fill-current"
							>
								<FaSquareCheck />
							</span>
						{:else}
							<span
								class="inline-block text-red-500 w-4 h-4 sm:w-5 sm:h-5 fill-current"
							>
								<FaSquareClose />
							</span>
						{/if}
						<span
							class="inline-block text-xs sm:text-sm font-bold text-gray-700"
						>
							{presentCheckinDate(check.date)}
						</span>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>
