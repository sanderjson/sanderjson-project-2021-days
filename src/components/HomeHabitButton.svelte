<script>
  import {
    errMessage,
    API_ENDPOINT,
    indexActiveHabit,
    userHabitsActive,
    isLSDataOutdated,
    isNewHabitCheckModal
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
    @apply bg-blue-100 opacity-50;
  }
</style>

<div class="flex flex-col">
  <button
    class:selected={$indexActiveHabit === i || ($indexActiveHabit === null && !habit.adminIsActive)}
    on:click={handleClick}
    class="bg-white py-1 px-2 border-2 border-blue-100 shadow rounded-sm
    hover:bg-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700
    focus:outline-none transition-colors duration-75">
    <HabitCard
      duration={habit.detailDuration}
      code={habit.detailCode}
      leaders={false}>
      {#if habit.adminIsActive}{timeUpdateFormat}{:else}complete{/if}
    </HabitCard>
  </button>

  <div>
    {#if $indexActiveHabit === i}
      <div class="sm:bg-white mt-2 sm:shadow sm:rounded-lg sm:px-6 sm:py-2">
        {#if !habit.adminIsActive}
          <AppButton handleFun={handleHabitReflect} text="Reflect" />
        {:else}
          <AppButton handleFun={handleTriggerHabitCheck} text="Check In" />
        {/if}
      </div>
    {/if}
  </div>

</div>
