<script>
  import {
    currentActiveHabit,
    isNewSocialModal,
    activeUserDetails,
    activeUserHabits,
    API_ENDPOINT,
    getUserHabitBlank,
    isActiveHabitComplete
  } from "../stores.js";
  import { fade } from "svelte/transition";
  import { push } from "svelte-spa-router";
  import AppHeader from "../components/AppHeader.svelte";
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import HomeHabitButton from "../components/HomeHabitButton.svelte";
  import HomeHabitButtonNull from "../components/HomeHabitButtonNull.svelte";

  import Modal from "../components/Modal.svelte";

  let selected;

  const contentModalSocial = {
    title: "Social Share Unavailable",
    details: "This feature will be enabled shortly, check back again.",
    button: "Go back to App"
  };

  const contentModalHabitIsComplete = {
    title: "Congratulations!",
    details: "Complete this reflection to track your progress",
    button: "Complete Habit"
  };

  const handleButtonHistory = () => {
    push("/history");
  };

  const handleHabitEdit = () => {
    push("/edit");
  };

  // const validActiveHabits = $activeUserHabits.filter(habit => {
  //   return habit.adminIsActive == true;
  // });

  // modals
  const handleButtonSocial = () => {
    isNewSocialModal.set(true);
  };

  const handleModalSocialAction = () => {
    isNewSocialModal.set(false);
  };

  // $: console.log("$activeUserHabits", $activeUserHabits);
</script>

<style>
  /* section > div {
    border: 1px solid black;
  } */

  .home-grid {
    display: flex;
    height: calc(100vh - 3rem);
    flex-direction: column;
  }

  .home-user {
    display: grid;
    place-items: center;
    grid-template-columns: 1fr 144px 1fr;
    grid-template-rows: repeat(4, 1fr);
  }

  .home-user .user-title {
    grid-area: title;
    grid-column: 1/4;
    grid-row: 1/2;
  }
  .home-user .user-img {
    grid-area: img;
    grid-column: 1/4;
    grid-row: 2/5;
  }
  .home-user .user-stat1 {
    grid-area: stat1;
    grid-column: 1/2;
    grid-row: 2/3;
  }
  .home-user .user-stat2 {
    grid-area: stat2;
    grid-column: 3/4;
    grid-row: 2/3;
  }
  .home-user .user-icon1 {
    grid-area: icon1;
    grid-column: 1/2;
    grid-row: 4/5;
  }
  .home-user .user-icon2 {
    grid-area: icon2;
    grid-column: 3/4;
    grid-row: 4/5;
  }

  .home-habit-info {
    flex-grow: 1;
  }
</style>

<div in:fade class="home-grid pb-2 overflow-y-scroll px-5">

  <section class="home-score pt-3">
    <div class="opacity-0 px-4 flex items-center justify-between">
      <div class="w-1/2 uppercase text-gray-500 font-bold text-xs">Info</div>
      <div
        class="flex justify-between uppercase text-gray-500 font-bold text-xs">
        <span>info</span>
        <span class="ml-2">info</span>
      </div>
    </div>
  </section>

  <section class="home-user home-user2 pt-6">
    <h1 class="user-title text-center ">
      <div class="text-lg font-bold leading-tight">
        {$activeUserDetails.name}
      </div>
      <div class="text-sm font-extrabold leading-tight text-blue-900">
        {$activeUserDetails.title}
      </div>
    </h1>
    <div class="user-img relative">
      <div class="absolute inset-0 bg-blue-100 rounded-full" />
      <!-- <img
        class="relative rounded-full m-1 z-0"
        src="https://via.placeholder.com/168"
        alt="" /> -->
      <div
        style="font-family: 'Bungee', cursive; width: 168px; height 168px;"
        class="relative rounded-full m-1 z-0 text-9xl flex justify-center
        items-center h-full">
        <span>{$activeUserDetails.initials}</span>
      </div>
    </div>
    <div
      class="user-stat1 bg-white text-lg border-1 h-10 w-10 flex justify-center
      items-center rounded-full border-blue-100 font-extrabold shadow ml-5">
      <span>{$activeUserHabits.length}</span>
    </div>
    <div
      class="user-stat2 bg-white text-lg border-1 h-10 w-10 flex justify-center
      items-center rounded-full border-blue-100 font-extrabold shadow mr-5">
      <span>{$activeUserDetails.habitHistoryIds.length}</span>
    </div>
    <button
      on:click={handleButtonHistory}
      class="user-icon1 bg-white h-14 w-14 flex justify-center items-center
      rounded-full border-2 border-blue-100 shadow hover:bg-blue-200
      focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none
      transition-colors duration-75">
      <i class=" fas fa-1x fa-history text-blue-900" />
      <!-- <i class=" fas fa-1x fa-envelope text-blue-900" /> -->
    </button>
    <button
      on:click={handleButtonSocial}
      class="user-icon2 bg-white h-14 w-14 flex justify-center items-center
      rounded-full border-2 border-blue-100 shadow hover:bg-blue-200
      focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none
      transition-colors duration-75">
      <i class=" fas fa-1x fa-share-alt text-blue-900" />
    </button>
  </section>

  <section class="home-habit-info pt-6 sm:mx-auto sm:w-full sm:max-w-md">
    <div
      class="relative bg-white h-full py-2 px-2 shadow rounded sm:rounded-lg
      sm:px-10 text-left">
      {#if $activeUserHabits[$currentActiveHabit]}
        <h1 class="text-xl font-bold">
          {$activeUserHabits[$currentActiveHabit].detailTitle}
        </h1>
      {:else}
        <h1 class="text-xl font-bold text-gray-500">Your New Habit</h1>
      {/if}
      {#if $activeUserHabits[$currentActiveHabit]}
        <p class="text-base mt-1 text-gray-700">
          {$activeUserHabits[$currentActiveHabit].detailDescription}
        </p>
      {:else}
        <p class="text-base mt-1 text-gray-500">
          What will you do? Who will you become? Tap the [Add] button below to
          create a new habit.
        </p>
      {/if}
      {#if $activeUserHabits[$currentActiveHabit]}
        <button
          on:click={handleHabitEdit}
          class="user-icon1 absolute right-0 bottom-0 inline-flex ml-2 bg-white
          h-6 w-6 justify-center items-center focus:outline-none
          focus:border-blue-400 focus:border-2 mr-2 mb-2">
          <i class="fas fa-1x fa-pencil-alt text-blue-900" />
          <!-- <span class="font-bold text-blue-100">[edit]</span> -->
        </button>
      {/if}
    </div>
  </section>

  <section
    class="home-habit-select pt-3 grid grid-cols-3 grid-rows-1 gap-3 sm:mx-auto
    sm:w-full sm:max-w-md">
    {#each $activeUserHabits as habit, i}
      {#if habit}
        <HomeHabitButton {habit} {i} />
      {:else}
        <HomeHabitButtonNull {i} />
      {/if}
    {/each}
  </section>
</div>

{#if $isNewSocialModal}
  <Modal contentModal={contentModalSocial}>
    <button
      on:click={handleModalSocialAction}
      type="button"
      class="inline-flex justify-center w-full rounded-md border
      border-transparent shadow-sm px-4 py-2 bg-blue-900 text-base font-medium
      text-white hover:bg-blue-500 focus:outline-none focus:ring-2
      focus:ring-offset-2 focus:ring-blue-700 sm:text-sm">
      {contentModalSocial.button}
    </button>
  </Modal>
{/if}
