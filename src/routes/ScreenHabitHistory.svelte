<script>
  import {
    userProfile,
    userHabitsActive,
    userHabitsHistory,
    isObjectEmpty,
    API_ENDPOINT,
    errMessage,
    userId,
    isLSDataOutdated,
    isDataOutdatedHistory,
    isNewSocialModal
  } from "../stores.js";
  import { push } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import HistoryCard from "../components/HistoryCard.svelte";
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AppHeaderLocalScore from "../components/AppHeaderLocalScore.svelte";
  import AppHeaderLocalTitle from "../components/AppHeaderLocalTitle.svelte";
  import AppButton from "../components/AppButton.svelte";
  import AppModal from "../components/AppModal.svelte";

  let isHistoryLoaded = false;

  let contentModalDeleteAll = {
    title: "Are You Sure You Want to Delete?",
    details:
      "This will delete all habits stored in the history.  There is no way to recover the data after this point.",
    button: "Delete All History Data"
  };

  const contentModalSocial = {
    title: "Social Share Unavailable",
    details: "This feature will be enabled shortly, check back again.",
    button: "Go back to App",
    button2: "Back"
  };

  let habitDeleteWarning = false;
  const handleDeleteAll = () => {
    habitDeleteWarning = !habitDeleteWarning;
  };

  const handleModalSocialAction = () => {
    isNewSocialModal.set(false);
  };

  const handleTriggerSocial = () => {
    isNewSocialModal.set(true);
  };

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
        isLSDataOutdated.set(true);
      })
      .catch(err => {
        console.clear();
        errMessage.set(err);
        push(`/error`);
      });
  };

  const handleModalDeleteAllAction = async () => {
    const fetchURL = $API_ENDPOINT + `/habits`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "content-type": "application/json"
      },

      body: JSON.stringify({
        ...$userProfile
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
        userProfile.set(res.userProfile);
        userHabitsHistory.set([]);
        isLSDataOutdated.set(true);
      })
      .catch(err => {
        // console.clear();
        errMessage.set(err);
        push(`/error`);
      });

    habitDeleteWarning = false;
  };

  if ($isDataOutdatedHistory) {
    getHabitHistory();
  }

  $: habitDeleteWarning;
  $: console.log("habitDeleteWarning", habitDeleteWarning);
</script>

<ContentWrapper>
  <div>
    <AppHeaderLocalScore />
    <AppHeaderLocalTitle
      title={'Habit History'}
      subtitle={'Track your progress and share'} />
    <div class="my-6 space-y-6">
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
    <AppButton handleFun={handleTriggerSocial} text="Share Habit History" />
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
            on:click={handleDeleteAll}
            class="w-full inline-flex justify-center py-2 px-4 border
            border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium
            text-gray-900 hover:bg-gray-50">
            <span class="">Delete All</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</ContentWrapper>

{#if $isNewSocialModal}
  <AppModal contentModal={contentModalSocial} modalDualButton={false}>
    <AppButton
      handleFun={handleModalSocialAction}
      text={contentModalSocial.button} />
  </AppModal>
{/if}

{#if habitDeleteWarning}
  <AppModal contentModal={contentModalDeleteAll}>

    <button
      on:click={handleModalDeleteAllAction}
      type="button"
      class="inline-flex justify-center w-full rounded-md border
      border-transparent shadow-sm px-4 py-2 bg-blue-900 text-base font-medium
      text-white hover:bg-blue-500 focus:outline-none focus:ring-2
      focus:ring-offset-2 focus:ring-blue-700 sm:text-sm">
      {contentModalDeleteAll.button}
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
          on:click={handleDeleteAll}
          class="w-full inline-flex justify-center py-2 px-4 border
          border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium
          text-gray-900 hover:bg-gray-50">
          <span class="">Back</span>
        </button>

      </div>

    </div>
  </AppModal>
{/if}
