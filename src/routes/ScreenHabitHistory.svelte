<script>
  import {
    userProfile,
    userHabitsActive,
    userHabitsHistory,
    isObjectEmpty,
    API_ENDPOINT,
    errMessage,
    userId,
    isDataOutdated,
    isDataOutdatedHistory
  } from "../stores.js";
  import { push } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import HistoryCard from "../components/HistoryCard.svelte";

  let isHistoryLoaded = false;

  const getHabitHistory = async () => {
    const fetchURL = $API_ENDPOINT + `/habits/${$userId}/history`;
    const fetchOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        habitIdsHistory: $userProfile.habitIdsHistory
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
        console.log("res", res);
        userHabitsHistory.set(res.userHabitsHistory);
        isDataOutdatedHistory.set(false);
        isDataOutdated.set(true);
      })
      .catch(err => {
        console.clear();
        errMessage.set(err);
        push(`/error`);
      });
  };

  if ($isDataOutdatedHistory) {
    getHabitHistory();
  }
</script>

<div
  in:fade
  class="pb-2 px-5 space-y-3 sm:w-full sm:max-w-md mt-8 mb-2 sm:mx-auto">

  {#each $userHabitsActive as habit}
    {#if habit && !$isObjectEmpty(habit)}
      <HistoryCard {habit} />
    {/if}
  {/each}
  {#await $isDataOutdatedHistory}
    Loading...
  {:then}
    {#each $userHabitsHistory as habit}
      {#if habit && !$isObjectEmpty(habit)}
        <HistoryCard {habit} />
      {/if}
    {/each}
  {/await}
</div>
