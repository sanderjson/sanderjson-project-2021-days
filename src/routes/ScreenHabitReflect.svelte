<script>
  import { onMount } from "svelte";
  import {
    errMessage,
    API_ENDPOINT,
    indexActiveHabit,
    userId,
    userHabitsActive,
    userHabitsHistory,
    userProfile,
    isLSDataOutdated
  } from "../stores.js";
  import { push } from "svelte-spa-router";
  import AppHeader from "../components/AppHeader.svelte";
  import TwentyTwentyOne from "../svg/2021.svelte";
  import AppModal from "../components/AppModal.svelte";
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AppHeaderLocalScore from "../components/AppHeaderLocalScore.svelte";
  import AppHeaderLocalTitle from "../components/AppHeaderLocalTitle.svelte";
  import HabitCard from "../components/HabitCard.svelte";

  let contentModalDelete = {
    title: "Are You Sure You Want to Delete?",
    details: "You will lose all data associated with this habit.",
    button: "Delete Habit Data"
  };

  let tempLocalUserHabit = $userHabitsActive[$indexActiveHabit];
  tempLocalUserHabit.reflectIsSuccessful = true;
  tempLocalUserHabit.reflectDifficulty = 5;
  tempLocalUserHabit.reflectRecommend = true;

  const handleToggleHabitRecommend = () => {
    tempLocalUserHabit.reflectRecommend = !tempLocalUserHabit.reflectRecommend;
  };
  const handleToggleHabitSuccess = () => {
    tempLocalUserHabit.reflectIsSuccessful = !tempLocalUserHabit.reflectIsSuccessful;
  };

  let habitDeleteWarning = false;
  const handleDelete = () => {
    habitDeleteWarning = !habitDeleteWarning;
  };

  const calculateHabitScore = () => {

  };

  const handleModalDeleteAction = async () => {

    
    const fetchURL =
      $API_ENDPOINT + `/habits/${tempLocalUserHabit.adminIdHabit}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "content-type": "application/json"
      },

      body: JSON.stringify({
        ...tempLocalUserHabit
      })
    };

    const handleErrors = res => {
      if (!res.ok) {
        return res.text().then(text => {
          throw text;
        });
      }
      return res.json();
    };

    const postData = await fetch(fetchURL, fetchOptions)
      .then(handleErrors)
      .then(res => {
        // console.log("res", res);
        let tempHabitsActive = $userHabitsActive;
        tempHabitsActive[$indexActiveHabit] = {};
        userHabitsActive.set(tempHabitsActive);
        userProfile.set(res.updatedUser);
        isLSDataOutdated.set(true);
      })
      .catch(err => {
        // console.clear();
        errMessage.set(err);
        push(`/error`);
      });

    habitDeleteWarning = false;
  };

  const handleModalHabitIsComplete = async () => {
    Object.assign(tempLocalUserHabit, {
      adminActivePosition: null,
      adminIsActive: false
    });
    const fetchURL =
      $API_ENDPOINT + `/habits/${tempLocalUserHabit.adminIdHabit}`;
    const fetchOptions = {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },

      body: JSON.stringify({
        ...tempLocalUserHabit
      })
    };

    const handleErrors = res => {
      if (!res.ok) {
        return res.text().then(text => {
          throw text;
        });
      }
      return res.json();
    };

    const postData = await fetch(fetchURL, fetchOptions)
      .then(handleErrors)
      .then(res => {
        // console.log("res", res);
        let tempHabitsActive = $userHabitsActive;
        let tempHabitsHistory = $userHabitsHistory;

        tempHabitsHistory.push(tempLocalUserHabit);
        userHabitsHistory.set(tempHabitsHistory);

        tempHabitsActive[$indexActiveHabit] = {};
        userHabitsActive.set(tempHabitsActive);

        userProfile.set(res.updatedUser);
        isLSDataOutdated.set(true);
      })
      .catch(err => {
        console.clear();
        errMessage.set(err);
        push(`/error`);
      });
  };
</script>

<style>
  input[type="range"] {
    width: 300px;
    margin: 18px 0;
    -webkit-appearance: none;
  }

  input[type="range"]:focus {
    outline: none;
  }

  input[type="range"] + label {
    @apply shadow;
    position: absolute;
    top: -25px;
    left: 110px;
    width: 80px;
    padding: 5px 0;
    text-align: center;
    border-radius: 4px;
  }

  /* Chrome & Safari */
  input[type="range"]::-webkit-slider-runnable-track {
    @apply bg-blue-900;
    border-radius: 4px;
    width: 100%;
    height: 10px;
    cursor: pointer;
  }

  input[type="range"]::-webkit-slider-thumb {
    @apply border-blue-900 border-2 border-solid;
    height: 24px;
    width: 24px;
    background: #fff;
    border-radius: 50%;
    margin-top: -7px;
    cursor: pointer;
    -webkit-appearance: none;
  }

  /* Firefox */
  input[type="range"]::-moz-range-track {
    @apply bg-blue-900;
    border-radius: 4px;
    width: 100%;
    height: 14px;
    cursor: pointer;
  }

  input[type="range"]::-moz-range-thumb {
    @apply border-blue-900 border-2 border-solid;
    height: 24px;
    width: 24px;
    background: #fff;
    border-radius: 50%;
    margin-top: -7px;
    cursor: pointer;
    -webkit-appearance: none;
  }

  /* IE */
  input[type="range"]::-ms-track {
    @apply bg-blue-900;
    border-radius: 4px;
    width: 100%;
    height: 14px;
    cursor: pointer;
  }

  input[type="range"]::-ms-thumb {
    @apply border-blue-900 border-2 border-solid;
    height: 24px;
    width: 24px;
    background: #fff;
    border-radius: 50%;
    margin-top: -7px;
    cursor: pointer;
    -webkit-appearance: none;
  }
</style>

<ContentWrapper>
  <div>
    <AppHeaderLocalScore />
    <AppHeaderLocalTitle
      title={'Habit Reflection'}
      subtitle={'Record your thoughts here'} />
    <div class="mt-6">
      <form
        class="space-y-6"
        on:submit|preventDefault={handleModalHabitIsComplete}>
        <div
          class="w-1/3 bg-white py-1 px-2 border-2 border-blue-100 shadow
          rounded-sm focus:outline-none">
          <HabitCard
            duration={tempLocalUserHabit.detailDuration}
            code={tempLocalUserHabit.detailCode}
            leaders={['Habit Duration', 'Habit Code', 'Elapsed Time']}>
            {#if tempLocalUserHabit.reflectIsSuccessful}
              <span class="bg-green-100 text-green-700 py-1 px-2 rounded-sm">
                success
              </span>
            {:else if tempLocalUserHabit.reflectIsSuccessful == null}
              <span class="bg-blue-100 text-blue-700 px-2 rounded-sm">
                active
              </span>
            {:else}
              <span class="bg-red-100 text-red-700 px-2 rounded-sm">fail</span>
            {/if}
          </HabitCard>

        </div>

        <div>
          <h1 class="text-xl font-bold">{tempLocalUserHabit.detailTitle}</h1>
          <p class="text-base mt-1 text-gray-700">
            {#if tempLocalUserHabit}
              {tempLocalUserHabit.detailDescription}
            {:else}
              What will you do? Who will you become? Tap the [Add] button below
              to create a new habit.
            {/if}
          </p>
        </div>

        <div>
          <label
            for="habit-reflect-comment"
            class="block text-sm font-medium text-gray-900">
            Your reflection
          </label>
          <div class="mt-1">
            <textarea
              bind:value={tempLocalUserHabit.reflectComment}
              id="habit-reflect-comment"
              name="habit-reflect-comment"
              required
              rows="3"
              placeholder="This is where you write a brief description of your
              results."
              class="appearance-none block w-full px-3 py-2 border
              border-gray-300 rounded-md shadow-sm placeholder-gray-400
              focus:outline-none focus:ring-blue-900 focus:border-blue-900
              sm:text-sm" />
          </div>
        </div>

        <div>
          <label
            for="habit-reflect-difficulty"
            class="block text-sm font-medium text-gray-900">
            Habit Difficulty: {tempLocalUserHabit.reflectDifficulty}
          </label>

          <div class="mt-1">
            <input
              bind:value={tempLocalUserHabit.reflectDifficulty}
              type="range"
              id="habit-reflect-difficulty"
              name="habit-reflect-difficulty"
              min="1"
              max="10"
              step="1"
              class="h-8 w-full" />
          </div>
        </div>

        <div class="flex items-center">
          <!-- On: "bg-blue-900", Off: "bg-gray-200" -->
          <button
            type="button"
            on:click={handleToggleHabitSuccess}
            aria-pressed="false"
            aria-labelledby="toggleLabel"
            class:bg-blue-900={tempLocalUserHabit.reflectIsSuccessful}
            class="bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11
            border-2 border-transparent rounded-full cursor-pointer
            transition-colors ease-in-out duration-200 focus:outline-none
            focus:ring-2 focus:ring-offset-2 focus:ring-blue-900">
            <span class="sr-only">Use setting</span>
            <span
              aria-hidden="true"
              class:translate-x-5={tempLocalUserHabit.reflectIsSuccessful}
              class="translate-x-5 inline-block h-5 w-5 rounded-full bg-white
              shadow transform ring-0 transition ease-in-out duration-200" />
          </button>

          <span class="ml-3" id="toggleLabel">
            <span class="text-sm font-medium text-gray-900">
              {#if tempLocalUserHabit.reflectIsSuccessful}
                Habit completed successfully
              {:else}Habit was not a sucesss{/if}
            </span>
            <!-- <span class="text-sm text-gray-900">(Save 10%)</span> -->
          </span>
        </div>

        <div class="flex items-center">
          <!-- On: "bg-blue-900", Off: "bg-gray-200" -->
          <button
            type="button"
            on:click={handleToggleHabitRecommend}
            aria-pressed="false"
            aria-labelledby="toggleLabel"
            class:bg-blue-900={tempLocalUserHabit.reflectRecommend}
            class="bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11
            border-2 border-transparent rounded-full cursor-pointer
            transition-colors ease-in-out duration-200 focus:outline-none
            focus:ring-2 focus:ring-offset-2 focus:ring-blue-900">
            <span class="sr-only">Use setting</span>
            <span
              aria-hidden="true"
              class:translate-x-5={tempLocalUserHabit.reflectRecommend}
              class="translate-x-5 inline-block h-5 w-5 rounded-full bg-white
              shadow transform ring-0 transition ease-in-out duration-200" />
          </button>

          <span class="ml-3" id="toggleLabel">
            <span class="text-sm font-medium text-gray-900">
              {#if tempLocalUserHabit.reflectRecommend}
                I do recommend this habit to others
              {:else}I do not recommend this habit{/if}
            </span>
            <!-- <span class="text-sm text-gray-900">(Save 10%)</span> -->
          </span>
        </div>

        <div class="mt-6">
          <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border
            border-transparent rounded-md shadow-sm text-sm font-bold text-white
            bg-blue-900 hover:bg-blue-900 focus:outline-none focus:ring-2
            focus:ring-offset-2 focus:ring-blue-900">
            Save to History
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
              on:click={handleDelete}
              class="w-full inline-flex justify-center py-2 px-4 border
              border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium
              text-gray-900 hover:bg-gray-50">
              <span class="">Delete</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</ContentWrapper>

{#if habitDeleteWarning}
  <AppModal contentModal={contentModalDelete}>
    <button
      on:click={handleModalDeleteAction}
      type="button"
      class="inline-flex justify-center w-full rounded-md border
      border-transparent shadow-sm px-4 py-2 bg-blue-900 text-base font-medium
      text-white hover:bg-blue-500 focus:outline-none focus:ring-2
      focus:ring-offset-2 focus:ring-blue-700 sm:text-sm">
      {contentModalDelete.button}
    </button>
    <div class="mt-6">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-900">Or</span>
        </div>
      </div>

      <div class="mt-6">

        <button
          on:click={handleDelete}
          class="w-full inline-flex justify-center py-2 px-4 border
          border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium
          text-gray-900 hover:bg-gray-50">
          <span class="">Back</span>
        </button>

      </div>

    </div>
  </AppModal>
{/if}
