<script>
  import {
    currentActiveHabit,
    errMessage,
    API_ENDPOINT,
    activeUserHabits,
    isNewActiveUserHabit,
    getUserHabitBlank
  } from "../stores.js";
  import { push } from "svelte-spa-router";

  export let habit;
  export let i;

  // habit == null ? () => (habit = $getUserHabitBlank()) : "";

  const handleClick = () => {
    currentActiveHabit.set(i);
  };

  const handleHabitAdd = () => {
    push("/add");
  };

  const handleHabitReflect = () => {
    push("/reflect");
  };

  const handleComplete = () => {
    console.log("complete");
  };
  const handleHabitCheck = async val => {
    const fetchURL = $API_ENDPOINT + "/addHabitCheck";
    const fetchOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },

      body: JSON.stringify({
        checkDate: new Date(),
        checkIsOk: val,
        habitId: habit.adminHabitId
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
        let newHabitData = $activeUserHabits;
        newHabitData[$currentActiveHabit] = res;
        activeUserHabits.set(newHabitData);
        isNewActiveUserHabit.set(true);
      })
      .catch(err => {
        console.clear();
        errMessage.set(err);
        push(`/error`);
      });
  };

  const handleHabitIsComplete = () => {
    let newHabitData = $activeUserHabits;
    newHabitData[i].adminIsActive = false;
    activeUserHabits.set(newHabitData);
  };

  const getTimeRemaining = (endTime, curTime) => {
    if (habit.adminIsActive) {
      let timeToReport = (endTime - curTime) / 1000;
      let val, unit;
      while (timeToReport > 0) {
        if (timeToReport > 86400) {
          val = timeToReport / 3600 / 24;
          unit = "days";
        } else if (timeToReport > 3600) {
          val = timeToReport / 3600;
          unit = "hrs";
        } else if (timeToReport > 60) {
          val = timeToReport / 60;
          unit = "min";
        } else {
          val = timeToReport;
          unit = "sec";
        }
        return `${val.toFixed(0)} ${unit}`;
      }
      if (timeToReport <= 0) {
        console.log("FIRE", i);
        handleHabitIsComplete();
      }
    }
  };

  const update = setInterval(() => {
    dateCurrent++;
  }, 1000);

  let dateStart = new Date(habit.detailDateStartUTCString).getTime();
  let dateEnd = new Date(habit.detailDateEndUTCString).getTime();
  let dateCurrent = new Date().getTime();
  let timeRemaining = getTimeRemaining(dateEnd, dateCurrent);

  $: dateCurrent;
  $: timeRemaining = getTimeRemaining(dateEnd, dateCurrent);

  // console.log("habit: ", i, habit);
</script>

<style>
  .selected {
    @apply bg-blue-100;
  }
</style>

<div class="flex flex-col">
  <button
    class:selected={$currentActiveHabit === i || ($currentActiveHabit === null && !habit.adminIsActive)}
    on:click={handleClick}
    class="bg-white py-1 px-2 border-2 border-blue-100 shadow rounded-sm
    hover:bg-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700
    focus:outline-none transition-colors duration-75">
    <div class="flex flex-col mx-auto">
      <div class="uppercase font-extrabold text-gray-900 text-xs text-left">
        {#if habit}
          {#if habit.detailDuration > 86400}
            {habit.detailDuration / 86400} days
          {:else if habit.detailDuration == 86400}24 hours{:else}1 hour{/if}
        {:else}Time{/if}
      </div>
      <div class="mt-1 text-6xl font-extrabold text-center text-blue-900">
        {#if habit}{habit.detailCode}{:else}+{/if}
      </div>
      <div class="mt-2 text-sm font-bold text-center text-gray-500 uppercase">
        {#if habit}
          {#if habit.adminIsActive}{timeRemaining}{:else}complete{/if}
        {:else}info{/if}
      </div>
    </div>
  </button>

  <div class="bg-white mt-2 shadow rounded-sm sm:rounded-lg sm:px-10">
    {#if habit}
      {#if !habit.adminIsActive && $currentActiveHabit === i}
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
      {:else if $currentActiveHabit === i}
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
