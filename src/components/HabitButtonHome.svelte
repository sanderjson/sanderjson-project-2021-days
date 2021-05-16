<script>
	import {
		indexActiveHabit,
		userHabitsActive,
		isNewHabitCheckModal,
		isReadyToHabitCheckArr,
	} from "../stores.js";
	import { push } from "svelte-spa-router";
	import HabitCard from "./HabitCard.svelte";
	import AppButton from "./AppButton.svelte";

	export let habit;
	export let i;

	const handleTriggerHabitCheck = () => {
		isNewHabitCheckModal.set(true);
	};

	let dateStart = new Date(habit.adminDateStartUTCString).getTime();
	let dateEnd = new Date(habit.adminDateEndUTCString).getTime();
	let dateCurrent = new Date().getTime();
	let dateLastCheckin;
	if (habit.checks.length > 0) {
		dateLastCheckin = new Date(habit.checks[habit.checks.length - 1].date);
	} else {
		dateLastCheckin = dateCurrent;
	}
	let numberChecks = habit.checks.length;

	let timeRemaining = Math.round((dateEnd - dateCurrent) / 1000);
	let timeSinceLastCheckin = Math.round((dateCurrent - dateLastCheckin) / 1000);
	let timeRemainingUntilNewCheckin =
		habit.detailCheckinFrequency - timeSinceLastCheckin;

	let isTimeUpdating = true;

	const handleClick = () => {
		indexActiveHabit.set(i);
	};

	const handleHabitAdd = () => {
		push("/add");
	};

	const handleHabitReflect = () => {
		push("/reflect");
	};

	const handleComplete = () => {
		// console.log("habit complete", habit);
		isTimeUpdating = false;
	};

	const handleHabitIsComplete = () => {
		let tempHabitsActive = $userHabitsActive;
		tempHabitsActive[i].adminIsActive = false;
		userHabitsActive.set(tempHabitsActive);
	};

	let val, unit;
	const formatTimeRemaining = (time) => {
		if (time > 86400) {
			val = time / 3600 / 24;
			unit = "days";
		} else if (time > 3600) {
			val = time / 3600;
			unit = "hrs";
		} else if (time > 60) {
			val = time / 60;
			unit = "min";
		} else {
			val = time;
			unit = "sec";
		}
		return `${val.toFixed(0)} ${unit}`;
	};

	const intervalUpdateTime = setInterval(() => {
		if (isTimeUpdating) {
			timeRemaining--;
			timeSinceLastCheckin++;
			timeRemainingUntilNewCheckin--;
			// console.log("timeRemainingUntilNewCheckin", timeRemainingUntilNewCheckin);
		}
	}, 1000);

	let timeUpdateFormat = formatTimeRemaining(timeRemaining);
	let timeUpdateFormatCheckin = formatTimeRemaining(
		timeRemainingUntilNewCheckin
	);

	const newCheckin = () => {
		timeSinceLastCheckin = 0;
		timeRemainingUntilNewCheckin = habit.detailCheckinFrequency;
	};

	const updateTime = () => {
		if (timeRemaining > 0) {
			timeUpdateFormat = formatTimeRemaining(timeRemaining);
			timeUpdateFormatCheckin = formatTimeRemaining(
				timeRemainingUntilNewCheckin
			);
			// console.log("timeRemainingUntilNewCheckin", timeRemainingUntilNewCheckin);
			if (
				timeSinceLastCheckin > habit.detailCheckinFrequency &&
				!$isReadyToHabitCheckArr[$indexActiveHabit] &&
				i == $indexActiveHabit
			) {
				// timeRemainingUntilNewCheckin = habit.detailCheckinFrequency;
				let tempHabitCheckArr = $isReadyToHabitCheckArr;
				tempHabitCheckArr[$indexActiveHabit] = true;
				isReadyToHabitCheckArr.set(tempHabitCheckArr);
			}
		} else {
			dateCurrent = false;
			let tempHabitCheckArr = $isReadyToHabitCheckArr;
			tempHabitCheckArr[indexActiveHabit] = false;
			isReadyToHabitCheckArr.set(tempHabitCheckArr);
			timeUpdateFormat = 0;
			timeSinceLastCheckin = 0;
			clearInterval(intervalUpdateTime);
			handleHabitIsComplete();
		}
	};

	// checkIfIsReadyForHabitCheck();
	$: timeRemaining && isTimeUpdating ? updateTime() : "";
	$: habit.checks.length > numberChecks ? newCheckin() : "";
	$: habit;

	// $: console.log({
	// 	change_i: i,
	// 	change_$indexActiveHabit: $indexActiveHabit,
	// 	change_$isReadyToHabitCheckArr: $isReadyToHabitCheckArr,
	// });

	// console.log({
	// 	initial_i: i,
	// 	initial_$indexActiveHabit: $indexActiveHabit,
	// 	initial_$isReadyToHabitCheckArr: $isReadyToHabitCheckArr,
	// });
</script>

<div class="flex flex-col">
	<button
		class:selected={$indexActiveHabit === i ||
			($indexActiveHabit === null && !habit.adminIsActive)}
		on:click={handleClick}
		class="bg-white py-1 px-2 border-2 border-blue-100 shadow rounded-sm
    hover:bg-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700
    focus:outline-none transition-colors duration-75"
	>
		<HabitCard
			duration={habit.detailDuration}
			code={habit.detailCode}
			leaders={false}
		>
			{#if habit.adminIsActive}{timeUpdateFormat}{:else}complete{/if}
		</HabitCard>
	</button>

	<div>
		{#if $indexActiveHabit === i}
			<div class="sm:bg-white mt-2 sm:shadow sm:rounded-lg sm:px-6 sm:py-2">
				{#if !habit.adminIsActive}
					<AppButton handleFun={handleHabitReflect}>Reflect</AppButton>
				{:else if $isReadyToHabitCheckArr[$indexActiveHabit] || habit.checks.length == 0}
					<AppButton handleFun={handleTriggerHabitCheck}>Check In</AppButton>
				{:else}
					<AppButton handleFun={null}>
						{timeUpdateFormatCheckin}</AppButton
					>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.selected {
		@apply bg-blue-100 opacity-50;
	}
</style>
