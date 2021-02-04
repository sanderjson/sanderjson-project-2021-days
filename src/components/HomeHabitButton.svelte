<script>
  import {
    errMessage,
    API_ENDPOINT,
    indexActiveHabit,
    userHabitsActive,
    isLSDataOutdated
  } from "../stores.js";
  import { push } from "svelte-spa-router";

  export let habit;
  export let i;

  let dateStart = new Date(habit.adminDateStartUTCString).getTime();
  let dateEnd = new Date(habit.adminDateEndUTCString).getTime();
  let dateCurrent = new Date().getTime();

  let timeRemaining = Math.round((dateEnd - dateCurrent) / 1000);
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
    console.log("COMPLETE ", i);
    isTimeUpdating = false;
  };
  const handleHabitCheck = async val => {
    let tempLocalUserHabit = habit;
    tempLocalUserHabit.checks.push({
      date: new Date(),
      isOk: val
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
        tempHabitsActive[$indexActiveHabit] = res.updatedHabit;
        userHabitsActive.set(tempHabitsActive);
        isLSDataOutdated.set(true);
      })
      .catch(err => {
        // console.clear();
        errMessage.set(err);
        push(`/error`);
      });
  };

  const handleHabitIsComplete = () => {
    let tempHabitsActive = $userHabitsActive;
    tempHabitsActive[i].adminIsActive = false;
    userHabitsActive.set(tempHabitsActive);
  };

  let val, unit;
  const formatTimeRemaining = time => {
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

  const updateTimeInterval = setInterval(() => {
    if (isTimeUpdating) {
      timeRemaining--;
    }
  }, 1000);

  let timeUpdateFormat = formatTimeRemaining(timeRemaining);

  const updateTime = () => {
    if (timeRemaining > 0) {
      timeUpdateFormat = formatTimeRemaining(timeRemaining);
    } else {
      dateCurrent = false;
      timeUpdateFormat = 0;
      clearInterval(updateTimeInterval);
      handleHabitIsComplete();
    }
  };

  $: timeRemaining && isTimeUpdating ? updateTime() : "";
</script>

<style>
  .selected {
    @apply bg-blue-100;
  }
</style>

<div class="flex flex-col">
  <button
    class:selected={$indexActiveHabit === i || ($indexActiveHabit === null && !habit.adminIsActive)}
    on:click={handleClick}
    class="bg-white py-1 px-2 border-2 border-blue-100 shadow rounded-sm
    hover:bg-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700
    focus:outline-none transition-colors duration-75">
    <div class="flex flex-col mx-auto">
      <div class="uppercase font-extrabold text-gray-900 text-xs text-left">
        {#if habit}
          {#if habit.detailDuration > 86400}
            {habit.detailDuration / 86400} days
          {:else if habit.detailDuration == 86400}
            24 hours
          {:else if habit.detailDuration > 3600}
            {habit.detailDuration / 3600} hours
          {:else if habit.detailDuration == 3600}
            60 mins
          {:else if habit.detailDuration > 60}
            {habit.detailDuration / 60} mins
          {:else}1 min{/if}
        {:else}Time{/if}
      </div>
      <div class="mt-1 text-6xl font-extrabold text-center text-blue-900">
        {#if habit}{habit.detailCode}{:else}+{/if}
      </div>
      <div class="mt-2 text-sm font-bold text-center text-gray-500 uppercase">
        {#if habit}
          {#if habit.adminIsActive}{timeUpdateFormat}{:else}complete{/if}
        {:else}info{/if}
      </div>
    </div>
  </button>

  <div class="bg-white mt-2 shadow rounded-sm sm:rounded-lg sm:px-10">
    {#if habit}
      {#if !habit.adminIsActive && $indexActiveHabit === i}
        <div class="py-1 flex justify-center items-center space-x-2">
          <button
            style="height: 32px"
            on:click={handleHabitReflect}
            class="flex justify-center items-center focus:ring-1 outline-none
            focus:ring-offset-1 focus:ring-green-500 focus:outline-none
            transition-colors duration-75">
            <span
              class="border-2 rounded-sm border-black bg-green-100 p-1 text-xs
              font-extrabold align-middle">
              Reflect
            </span>
          </button>
        </div>
      {:else if $indexActiveHabit === i}
        <div class="py-1 flex justify-center items-center space-x-2">
          <button
            on:click={() => handleHabitCheck(true)}
            class="flex justify-center items-center focus:ring-1 outline-none
            focus:ring-offset-1 focus:ring-green-500 focus:outline-none
            transition-colors duration-75">
            <!-- <ActionCheck /> -->
            <i class="bg-green-100 far fa-2x fa-check-square" />
          </button>
          <button
            on:click={() => handleHabitCheck(false)}
            class="flex justify-center items-center focus:ring-1 outline-none
            focus:ring-offset-1 focus:ring-red-500 focus:outline-none
            transition-colors duration-75">
            <i class="bg-red-100 far fa-2x fa-window-close" />
          </button>
        </div>
      {/if}
    {:else}
      <div class="py-1 flex justify-center items-center space-x-2">
        <button
          style="height: 32px"
          on:click={handleHabitAdd}
          class="flex justify-center items-center focus:ring-1 outline-none
          focus:ring-offset-1 focus:ring-green-500 focus:outline-none
          transition-colors duration-75">
          <span
            class="border-2 rounded-sm border-black bg-green-100 p-1 text-xs
            font-extrabold align-middle">
            ADD
          </span>
        </button>
      </div>
    {/if}
  </div>
</div>
