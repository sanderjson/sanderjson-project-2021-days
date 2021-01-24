<script>
  import { onMount } from "svelte";
  import {
    errMessage,
    API_ENDPOINT,
    contentHabitDetailCategory,
    contentHabitDuration,
    currentActiveHabit,
    getUserHabitBlank,
    isNewActiveUserHabit,
    activeUserId,
    activeUserDetails,
    activeUserHabits
  } from "../stores.js";
  import { push } from "svelte-spa-router";
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AppHeader from "../components/AppHeader.svelte";
  import TwentyTwentyOne from "../svg/2021.svelte";

  let userHabitTemp = $activeUserHabits[$currentActiveHabit];

  const getNewDate = () => {
    return new Date();
  };

  let selected;
  const handleSelectDuration = option => {
    let dateStart = getNewDate();
    let dateEnd = getNewDate();
    dateEnd.setDate(dateEnd.getDate() + option.value);
    userHabitTemp.detailDateStartUTCString = dateStart.toUTCString();
    userHabitTemp.detailDateEndUTCString = dateEnd.toUTCString();
    userHabitTemp.detailDuration = option.value;
  };

  const handleToggleHabit = () => {
    userHabitTemp.detailIsNewHabit = !userHabitTemp.detailIsNewHabit;
  };

  const handleReset = () => {
    userHabitTemp = $getUserHabitBlank();
  };

  const handleDelete = () => {
    console.log("delete");
    // show modal
    // delete from db
    // reset userHabitTemp
  };

  const handleSaveOrUpdateHabit = async () => {
    const fetchURL = $API_ENDPOINT + "/createNewHabit";
    const fetchOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },

      body: JSON.stringify({
        adminActivePosition: $currentActiveHabit,
        adminIsActive: userHabitTemp.adminIsActive,
        adminUserId: $activeUserId,
        adminHabitId: userHabitTemp.adminHabitId,
        adminSeriesId: userHabitTemp.adminSeriesId,
        adminScore: userHabitTemp.adminScore,
        adminIsSuccessful: userHabitTemp.adminIsSuccessful,
        detailIsCategory1: userHabitTemp.detailIsCategory1,
        detailIsCategory2: userHabitTemp.detailIsCategory2,
        detailIsCategory3: userHabitTemp.detailIsCategory3,
        detailCode: userHabitTemp.detailCode,
        detailDateEndUTCString: userHabitTemp.detailDateEndUTCString,
        detailDateStartUTCString: userHabitTemp.detailDateStartUTCString,
        detailDuration: userHabitTemp.detailDuration,
        detailDescription: userHabitTemp.detailDescription,
        detailIsNewHabit: userHabitTemp.detailIsNewHabit,
        detailTitle: userHabitTemp.detailTitle,
        checks: userHabitTemp.checks,
        messages: userHabitTemp.messages
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
        activeUserDetails.set(res.userDetails);
        let newHabitData = $activeUserHabits;
        newHabitData[$currentActiveHabit] = res.newHabit;
        activeUserHabits.set(newHabitData);
        isNewActiveUserHabit.set(true);
      })
      .catch(err => {
        console.clear();
        errMessage.set(err);
        push(`/error`);
      });
  };

  onMount(() => {
    handleSelectDuration($contentHabitDuration[0]);
  });
</script>

<!-- <AppHeader>
  <TwentyTwentyOne />
</AppHeader> -->

<ContentWrapper>
  <div>
    <form class="space-y-6" on:submit|preventDefault={handleSaveOrUpdateHabit}>

      <div
        class="w-1/3 bg-white py-1 px-2 border-2 border-blue-100 shadow
        rounded-sm focus:outline-none">
        <div class="flex flex-col mx-auto">
          <div
            class="relative uppercase font-extrabold text-gray-900 text-xs
            text-left">
            {#if userHabitTemp.detailDuration > 1}
              {userHabitTemp.detailDuration} Days
            {:else}24 Hours{/if}
            <span
              style="height: 50%; top: 50%; width: 28vw; left: calc(100% +
              .5rem)"
              class="absolute text-blue-900 border-t-2 green-500" />
            <span
              style="left: calc(100% + 28vw)"
              class="ml-2 p-2 rounded flex justify-center items-center absolute
              top-0 bottom-0 leading-none text-xs font-extrabold text-gray-900
              uppercase text-left">
              Habit Duration
            </span>
          </div>
          <div
            class="relative mt-1 text-6xl font-extrabold text-center
            text-blue-900">
            {#if userHabitTemp.detailCode}
              {userHabitTemp.detailCode}
            {:else}+{/if}
            <span
              style="height: 50%; top: 50%; width: 23vw; left: calc(100% +
              .5rem)"
              class="absolute text-blue-900 border-t-2 green-500" />
            <span
              style="left: calc(100% + 23vw);"
              class="ml-2 p-2 rounded flex justify-center items-center absolute
              top-0 bottom-0 leading-none text-xs font-extrabold text-gray-900
              uppercase text-left">
              Habit Code
            </span>
          </div>

          <div
            class="relative mt-2 text-sm font-bold text-center text-gray-900
            uppercase">
            info
            <span
              style="height: 50%; top: 50%; width: 28vw; left: calc(100% +
              .5rem)"
              class="absolute text-blue-900 border-t-2 green-500" />
            <span
              style="left: calc(100% + 28vw);"
              class="ml-2 p-2 rounded flex justify-center items-center absolute
              top-0 bottom-0 leading-none text-xs font-extrabold text-gray-900
              uppercase text-left">
              Elapsed Time
            </span>
          </div>
        </div>
      </div>

      <div>
        <label
          for="habit-title"
          class="block text-sm font-medium text-gray-900">
          Habit Title
        </label>
        <div class="mt-1">
          <input
            bind:value={userHabitTemp.detailTitle}
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
          focus:outline-none focus:ring-blue-900 focus:border-blue-900
          sm:text-sm rounded-md">
          {#each $contentHabitDuration as option}
            <option disabled={option.disabled} value={option}>
              {option.text}
            </option>
          {/each}
        </select>
      </div>

      <div>
        <label for="habit-desc" class="block text-sm font-medium text-gray-900">
          Habit Description
        </label>
        <div class="mt-1">
          <textarea
            bind:value={userHabitTemp.detailDescription}
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
            bind:value={userHabitTemp.detailCode}
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
          class:bg-blue-900={userHabitTemp.detailIsNewHabit}
          class="bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11
          border-2 border-transparent rounded-full cursor-pointer
          transition-colors ease-in-out duration-200 focus:outline-none
          focus:ring-2 focus:ring-offset-2 focus:ring-blue-900">
          <span class="sr-only">Use setting</span>
          <!-- On: "translate-x-5", Off: "translate-x-0" -->
          <span
            aria-hidden="true"
            class:translate-x-5={userHabitTemp.detailIsNewHabit}
            class="translate-x-5 inline-block h-5 w-5 rounded-full bg-white
            shadow transform ring-0 transition ease-in-out duration-200" />
        </button>
        <span class="ml-3" id="toggleLabel">
          <span class="text-sm font-medium text-gray-900">
            {#if userHabitTemp.detailIsNewHabit}
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
                    bind:checked={userHabitTemp[`detailIsCategory${i + 1}`]}
                    id={category.label}
                    name={category.label}
                    type="checkbox"
                    class="focus:ring-blue-900 h-4 w-4 text-blue-900
                    border-gray-300 rounded" />
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
          Save
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
            on:click={handleReset}
            class="w-full inline-flex justify-center py-2 px-4 border
            border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium
            text-gray-900 hover:bg-gray-50">
            <span class="">Reset</span>
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

</ContentWrapper>
