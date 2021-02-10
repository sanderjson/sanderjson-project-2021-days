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

  const contentModalSocial = {
    title: "Social Share Unavailable",
    details: "This feature will be enabled shortly, check back again.",
    button: "Go back to App",
    button2: "Back"
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

  if ($isDataOutdatedHistory) {
    getHabitHistory();
  }
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
  </div>
</ContentWrapper>

{#if $isNewSocialModal}
  <AppModal contentModal={contentModalSocial} modalDualButton={false}>
    <AppButton
      handleFun={handleModalSocialAction}
      text={contentModalSocial.button} />
  </AppModal>
{/if}
