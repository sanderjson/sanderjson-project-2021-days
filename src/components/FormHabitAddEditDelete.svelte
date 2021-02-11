<script>
  import { onMount } from "svelte";
  import {
    contentHabitDetailCategory,
    contentHabitDuration
  } from "../stores.js";
  import { push } from "svelte-spa-router";
  import ContentWrapper from "./ContentWrapper.svelte";
  import AppHeader from "./AppHeader.svelte";
  import TwentyTwentyOne from "../svg/2021.svelte";
  import AppModal from "./AppModal.svelte";
  import HabitCardInfoLeader from "./HabitCardInfoLeader.svelte";
  import HabitCard from "./HabitCard.svelte";

  export let tempLocalUserHabit;
  export let actionTitle;
  export let altActionTitle;
  export let handleAltAction;
  export let handleSubmit;

  // tempLocalUserHabit.duration = 3600;
  // {
  //       disabled: false,
  //       value: 3600 * 8,
  //       text: "8 hours"
  //     }

  const handleLocalSubmit = () => {
    handleSubmit();
  };

  const getNewDate = () => {
    return new Date();
  };

  let selected;
  const handleSelectDuration = option => {
    let dateStart = getNewDate();
    let dateEnd = getNewDate();
    dateEnd.setSeconds(dateEnd.getSeconds() + option.value);
    tempLocalUserHabit.adminDateStartUTCString = dateStart.toUTCString();
    tempLocalUserHabit.adminDateEndUTCString = dateEnd.toUTCString();
    tempLocalUserHabit.detailDuration = option.value;
  };

  const handleToggleHabit = () => {
    tempLocalUserHabit.detailIsNewHabit = !tempLocalUserHabit.detailIsNewHabit;
  };

  // console.log("tempLocalUserHabit", tempLocalUserHabit);
</script>

<form class="space-y-6" on:submit|preventDefault={handleLocalSubmit}>

  <div
    class="w-1/3 bg-white py-1 px-2 border-2 border-blue-100 shadow rounded-sm
    focus:outline-none">
    <HabitCard
      duration={tempLocalUserHabit.detailDuration}
      code={tempLocalUserHabit.detailCode}
      leaders={['Habit Duration', 'Habit Code', 'Elapsed Time']}>
      info
    </HabitCard>

  </div>

  <div>
    <label for="habit-title" class="block text-sm font-medium text-gray-900">
      Habit Title
    </label>
    <div class="mt-1">
      <input
        bind:value={tempLocalUserHabit.detailTitle}
        id="habit-title"
        name="habit-title"
        required
        class="appearance-none block w-full px-3 py-2 border border-gray-300
        rounded-md shadow-sm placeholder-gray-400 focus:outline-none
        focus:ring-blue-900 focus:border-blue-900 sm:text-sm" />
    </div>
  </div>

  <div>
    <label for="location" class="block text-sm font-medium text-gray-900">
      Duration
    </label>
    <select
      bind:value={selected}
      on:change={() => handleSelectDuration(selected)}
      id="habit-duration"
      name="habit-duration"
      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300
      focus:outline-none focus:ring-blue-900 focus:border-blue-900 sm:text-sm
      rounded-md">
      {#each $contentHabitDuration as option}
        {#if (option.value == 3600 && !tempLocalUserHabit.adminIsActive) || (tempLocalUserHabit.adminIsActive && option.value == tempLocalUserHabit.detailDuration)}
          <option selected disabled={option.disabled} value={option}>
            {option.text}
          </option>
        {:else}
          <option disabled={option.disabled} value={option}>
            {option.text}
          </option>
        {/if}
      {/each}
    </select>
  </div>

  <div>
    <label for="habit-desc" class="block text-sm font-medium text-gray-900">
      Habit Description
    </label>
    <div class="mt-1">
      <textarea
        bind:value={tempLocalUserHabit.detailDescription}
        id="habit-desc"
        name="habit-desc"
        required
        rows="3"
        class="appearance-none block w-full px-3 py-2 border border-gray-300
        rounded-md shadow-sm placeholder-gray-400 focus:outline-none
        focus:ring-blue-900 focus:border-blue-900 sm:text-sm" />
    </div>
  </div>

  <div>
    <label for="habit-code" class="block text-sm font-medium text-gray-900">
      Habit Code
    </label>
    <div class="mt-1">
      <input
        bind:value={tempLocalUserHabit.detailCode}
        id="habit-code"
        name="habit-code"
        required
        maxlength="2"
        class="appearance-none block w-full px-3 py-2 border border-gray-300
        rounded-md shadow-sm placeholder-gray-400 focus:outline-none
        focus:ring-blue-900 focus:border-blue-900 sm:text-sm" />
    </div>
  </div>

  <div class="flex items-center">
    <!-- On: "bg-blue-900", Off: "bg-gray-200" -->
    <button
      type="button"
      on:click={handleToggleHabit}
      aria-pressed="false"
      aria-labelledby="toggleLabel"
      class:bg-blue-900={tempLocalUserHabit.detailIsNewHabit}
      class="bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2
      border-transparent rounded-full cursor-pointer transition-colors
      ease-in-out duration-200 focus:outline-none focus:ring-2
      focus:ring-offset-2 focus:ring-blue-900">
      <span class="sr-only">Use setting</span>
      <!-- On: "translate-x-5", Off: "translate-x-0" -->
      <span
        aria-hidden="true"
        class:translate-x-5={tempLocalUserHabit.detailIsNewHabit}
        class="translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow
        transform ring-0 transition ease-in-out duration-200" />
    </button>
    <span class="ml-3" id="toggleLabel">
      <span class="text-sm font-medium text-gray-900">
        {#if tempLocalUserHabit.detailIsNewHabit}
          Start a new habit
        {:else}Kick an old habit{/if}
      </span>
      <!-- <span class="text-sm text-gray-900">(Save 10%)</span> -->
    </span>
  </div>

  <!-- checklist -->
  <div class="mt-6">
    <fieldset>
      <legend class="block text-sm font-medium text-gray-900">
        Habit category
        <span class="text-sm text-gray-900">(check any that apply)</span>
        :
      </legend>
      <div class="mt-4 space-y-4">

        {#each $contentHabitDetailCategory as category, i}
          <div class="relative flex items-start">
            <div class="flex items-center h-5">
              <input
                bind:checked={tempLocalUserHabit.detailCategory[`isCategory${i + 1}`]}
                id={category.label}
                name={category.label}
                type="checkbox"
                class="focus:ring-blue-900 h-4 w-4 text-blue-900 border-gray-300
                rounded" />
            </div>
            <div class="ml-3 text-sm">
              <label for="comments" class="font-medium text-gray-900">
                {category.title}
              </label>
              <p class="font-base text-gray-500">{category.content}</p>
            </div>
          </div>
        {/each}

      </div>
    </fieldset>
  </div>

  <div class="mt-6">
    <button
      type="submit"
      class="w-full flex justify-center py-2 px-4 border border-transparent
      rounded-md shadow-sm text-sm font-bold text-white bg-blue-900
      hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2
      focus:ring-blue-900">
      {actionTitle}
    </button>
  </div>
</form>

<div class="mt-6">
  <div class="relative">
    <div class="absolute inset-0 flex items-center">
      <div class="w-full border-t border-gray-300" />
    </div>
    <div class="relative flex justify-center text-sm">
      <span class="px-2 bg-white text-gray-900">Or</span>
    </div>
  </div>

  <div class="mt-6 grid grid-cols-2 gap-3">
    <div>
      <button
        on:click={() => push('/')}
        class="w-full inline-flex justify-center py-2 px-4 border
        border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium
        text-gray-900 hover:bg-gray-50">
        <span class="">Back</span>
      </button>
    </div>
    <div>
      <button
        on:click={handleAltAction}
        class="w-full inline-flex justify-center py-2 px-4 border
        border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium
        text-gray-900 hover:bg-gray-50">
        <span class="">{altActionTitle}</span>
      </button>
    </div>
  </div>

</div>
