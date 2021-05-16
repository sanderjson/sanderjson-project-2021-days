<script>
	import {
		errMessage,
		API_ENDPOINT,
		indexActiveHabit,
		isNewHabitCheckModal,
		isReadyToHabitCheckArr,
		userProfile,
		userHabitsActive,
		userHabitsHistory,
		isObjectEmpty,
		isLSDataOutdated,
	} from "../stores.js";
	import { fade } from "svelte/transition";
	import { push } from "svelte-spa-router";
	import ContentWrapper from "../components/ContentWrapper.svelte";
	import HabitButtonHome from "../components/HabitButtonHome.svelte";
	import HabitButtonNullHome from "../components/HabitButtonNullHome.svelte";
	import AppHeaderLocalScore from "../components/AppHeaderLocalScore.svelte";
	import AppHeaderLocalTitle from "../components/AppHeaderLocalTitle.svelte";
	import AppButton from "../components/AppButton.svelte";
	import AppModal from "../components/AppModal.svelte";
	import FaHistory from "../svg/fa-history.svelte";
	import FaPencilAlt from "../svg/fa-pencil-alt.svelte";

	let selected;
	let userHabitsActiveClean = $userHabitsActive.filter((habit) => {
		if (!$isObjectEmpty(habit)) {
			return habit;
		}
	});

	const contentModalHabitCheck = {
		title: "Check in!",
		details: "How is this habit going right now?",
		button: "Complete Check",
		button2: "Back",
	};

	const contentModalHabitIsComplete = {
		title: "Congratulations!",
		details: "Complete this reflection to track your progress",
		button: "Complete Habit",
		button2: "Back",
	};

	const handleTriggerHistory = () => {
		push("/history");
	};

	const handleTriggerUserEdit = () => {
		push("/settings");
	};

	const handleTriggerHabitEdit = () => {
		push("/edit");
	};

	const handleModalHabitCheck = async (val) => {
		let tempLocalUserHabit = $userHabitsActive[$indexActiveHabit];
		// console.log("tempLocalUserHabit", tempLocalUserHabit);
		tempLocalUserHabit.checks.push({
			date: new Date(),
			isOk: val,
		});
		const fetchURL =
			$API_ENDPOINT + `/habits/${tempLocalUserHabit.adminIdHabit}`;
		const fetchOptions = {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
			},

			body: JSON.stringify({
				...tempLocalUserHabit,
			}),
		};

		const handleErrors = (res) => {
			if (!res.ok) {
				return res.text().then((text) => {
					throw text;
				});
			}
			return res.json();
		};

		const postData = await fetch(fetchURL, fetchOptions)
			.then(handleErrors)
			.then((res) => {
				// console.log("res", res);
				let tempHabitsActive = $userHabitsActive;
				tempHabitsActive[$indexActiveHabit] = res.updatedHabit;
				userHabitsActive.set(tempHabitsActive);
				isNewHabitCheckModal.set(false);
				let tempHabitCheckArr = $isReadyToHabitCheckArr;
				tempHabitCheckArr[$indexActiveHabit] = false;
				isReadyToHabitCheckArr.set(tempHabitCheckArr);
				isLSDataOutdated.set(true);
			})
			.catch((err) => {
				// console.clear();
				errMessage.set(err);
				push(`/error`);
			});
	};

	$: $userHabitsActive;
	$: $userHabitsHistory;
</script>

<ContentWrapper>
	<div>
		<AppHeaderLocalScore />
		<AppHeaderLocalTitle
			title={$userProfile.detailName}
			subtitle={$userProfile.detailTitle}
		/>
		<div class="mt-6">
			<section class="home-user">
				<div class="user-img relative">
					<div
						class="absolute inset-0 bg-blue-100 bg-opacity-50 rounded-full"
					/>
					<!-- <img
        class="relative rounded-full m-1 z-0"
        src="https://via.placeholder.com/168"
        alt="" /> -->
					<div
						style="font-family: 'Alt-Smaq', cursive; width: 168px; height 168px;"
						class="relative text-center rounded-full m-1 z-0 text-9xl
            sm:text-10xl leading-none"
					>
						<div>{$userProfile.detailInitials}</div>
					</div>
				</div>
				<div
					class="user-stat1 bg-white text-lg border-1 h-10 w-10 flex
          justify-center items-center rounded-full border-blue-100
          font-extrabold shadow ml-5"
				>
					<span>{userHabitsActiveClean.length}</span>
				</div>
				<div
					class="user-stat2 bg-white text-lg border-1 h-10 w-10 flex
          justify-center items-center rounded-full border-blue-100
          font-extrabold shadow mr-5"
				>
					<span>{$userHabitsHistory.length}</span>
				</div>
				<button
					on:click={handleTriggerHistory}
					class="user-icon1 bg-white h-14 w-14 flex justify-center items-center
          rounded-full border-2 border-blue-100 shadow hover:bg-blue-200
          focus:ring-2 focus:ring-offset-2 focus:ring-blue-700
          focus:outline-none transition-colors duration-75"
				>
					<span class="text-blue-900 w-6 h-6 fill-current">
						<FaHistory />
					</span>
				</button>
				<button
					on:click={handleTriggerUserEdit}
					class="user-icon2 bg-white h-14 w-14 flex justify-center items-center
          rounded-full border-2 border-blue-100 shadow hover:bg-blue-200
          focus:ring-2 focus:ring-offset-2 focus:ring-blue-700
          focus:outline-none transition-colors duration-75"
				>
					<span class="text-blue-900 w-5 h-5 fill-current">
						<FaPencilAlt />
					</span>
				</button>
			</section>
			<section class="pt-12 ">
				<div
					style="min-height: 160px"
					class="relative bg-white h-full py-2 px-2 shadow rounded sm:rounded-lg
          sm:px-5 text-left"
				>
					{#if $userHabitsActive[$indexActiveHabit] && !$isObjectEmpty($userHabitsActive[$indexActiveHabit])}
						<h1 class="text-xl font-bold">
							{$userHabitsActive[$indexActiveHabit].detailTitle}
						</h1>
						<p class="text-base mt-1 text-gray-700">
							{$userHabitsActive[$indexActiveHabit].detailDescription}
						</p>
						<button
							on:click={handleTriggerHabitEdit}
							class="user-icon1 absolute right-0 bottom-0 inline-flex ml-2
              bg-white h-6 w-6 justify-center items-center focus:outline-none
              focus:border-blue-400 focus:border-2 mr-2 mb-2"
						>
							<span class="text-blue-900 w-3 h-3 fill-current">
								<FaPencilAlt />
							</span>
						</button>
					{:else}
						<h1 class="text-xl font-bold text-gray-500">Your New Habit</h1>
						<p class="text-base mt-1 text-gray-500">
							What will you do? Who will you become? Tap the [Add] button below
							to create a new habit.
						</p>
					{/if}
				</div>
			</section>
			<section class="pt-3">
				<div class="grid grid-cols-3 grid-rows-1 gap-3">
					{#each $userHabitsActive as habit, i}
						{#if habit && !$isObjectEmpty(habit)}
							<HabitButtonHome {habit} {i} />
						{:else}
							<HabitButtonNullHome {i} />
						{/if}
					{/each}
				</div>
			</section>
		</div>
	</div>
</ContentWrapper>

{#if $isNewHabitCheckModal}
	<AppModal contentModal={contentModalHabitCheck} modalDualButton={true}>
		<AppButton handleFun={() => handleModalHabitCheck(true)} success={true}
			>On Track</AppButton
		>
		<AppButton handleFun={() => handleModalHabitCheck(false)} danger={true}
			>Having Trouble</AppButton
		>
	</AppModal>
{/if}

<style>
	.home-user {
		display: grid;
		place-items: center;
		grid-template-columns: 1fr 144px 1fr;
		grid-template-rows: repeat(3, 1fr);
	}

	.home-user .user-img {
		grid-area: img;
		grid-column: 1/4;
		grid-row: 1/4;
	}
	.home-user .user-stat1 {
		grid-area: stat1;
		grid-column: 1/2;
		grid-row: 1/2;
	}
	.home-user .user-stat2 {
		grid-area: stat2;
		grid-column: 3/4;
		grid-row: 1/2;
	}
	.home-user .user-icon1 {
		grid-area: icon1;
		grid-column: 1/2;
		grid-row: 3/4;
	}
	.home-user .user-icon2 {
		grid-area: icon2;
		grid-column: 3/4;
		grid-row: 3/4;
	}
</style>
