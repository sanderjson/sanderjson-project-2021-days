<script>
  import {
    currentActiveHabit,
    errMessage,
    API_ENDPOINT,
    activeUserHabits,
    isNewActiveUserHabit
  } from "../stores.js";
  import { push } from "svelte-spa-router";

  export let habit;
  export let i;

  const handleClick = () => {
    currentActiveHabit.set(i);
  };

  const handleHabitAdd = () => {
    push("/add");
  };

  const update = setInterval(() => {
    dateCurrent++;
  }, 1000);

  const getTimeRemaining = (endTime, curTime) => {
    if (habit.adminIsActive) {
      let timeToReport = (endTime - curTime) / 1000;
      let val, unit;
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
  };

  let dateStart = new Date(habit.detailDateStartUTCString).getTime();
  let dateEnd = new Date(habit.detailDateEndUTCString).getTime();
  let dateCurrent = new Date().getTime();
  let timeRemaining = getTimeRemaining(dateEnd, dateCurrent);

  // const handleHabitCheck = val => {
  //   console.log(val);
  // };

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
        // res.check = {
        // date: "",
        // isOk: bool
        // }
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

  $: updateTime = dateEnd - dateCurrent;
  $: timeRemaining = getTimeRemaining(dateEnd, dateCurrent);
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
        {#if habit.adminIsActive && habit.detailDuration > 1}
          {habit.detailDuration} day
        {:else if habit.adminIsActive}24 hours{:else}Time{/if}
      </div>
      {#if habit.adminIsActive}
        <div class="mt-1 text-6xl font-extrabold text-center text-blue-900">
          {habit.detailCode}
        </div>
      {:else}
        <div class="mt-1 text-6xl font-bold text-center text-blue-900">+</div>
      {/if}
      <div class="mt-2 text-sm font-bold text-center text-gray-500 uppercase">
        {#if habit.adminIsActive}{timeRemaining}{:else}info{/if}
      </div>
    </div>
  </button>
  <div class="bg-white mt-2 shadow rounded-sm sm:rounded-lg sm:px-10">
    {#if !habit.adminIsActive && $currentActiveHabit === i}
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
  </div>
</div>
