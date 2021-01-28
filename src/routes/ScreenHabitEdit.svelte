<script>
  import { onMount } from "svelte";
  import {
    errMessage,
    API_ENDPOINT,
    currentActiveHabit,
    getUserHabitBlank,
    isNewActiveUserHabit,
    activeUserId,
    activeUserHabits,
    activeUserDetails,

    tempUserHabit
  } from "../stores.js";
  import { push } from "svelte-spa-router";
  import AppHeader from "../components/AppHeader.svelte";
  import TwentyTwentyOne from "../svg/2021.svelte";
  import Modal from "../components/Modal.svelte";
  import AddEditDeleteHabit from "../components/AddEditDeleteHabit.svelte";

  let tempLocalUserHabit = $activeUserHabits[$currentActiveHabit];

  let contentModalDelete = {
    title: "Are You Sure You Want to Delete?",
    details: "You will lose all data associated with this habit.",
    button: "Delete Habit Data"
  };

  const handleModalDeleteAction = async () => {
    const fetchURL = $API_ENDPOINT + "/deleteExistingHabit";
    const fetchOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },

      body: JSON.stringify({
        adminHabitId: tempLocalUserHabit.adminHabitId
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
        // res = null
        let newHabitData = $activeUserHabits;
        newHabitData[$currentActiveHabit] = null;
        activeUserHabits.set(newHabitData);
        isNewActiveUserHabit.set(true);
      })
      .catch(err => {
        console.clear();
        errMessage.set(err);
        push(`/error`);
      });

    habitDeleteWarning = false;
  };

  let habitDeleteWarning = false;
  const handleDelete = () => {
    habitDeleteWarning = true;
    console.log("delete");
  };

  const handleSubmitEditExistingHabit = async () => {
    const fetchURL = $API_ENDPOINT + "/editExistingHabit";
    const fetchOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },

      body: JSON.stringify({
        adminActivePosition: $currentActiveHabit,
        adminIsActive: tempLocalUserHabit.adminIsActive,
        adminUserId: $activeUserId,
        adminHabitId: tempLocalUserHabit.adminHabitId,
        adminSeriesId: tempLocalUserHabit.adminSeriesId,
        adminScore: tempLocalUserHabit.adminScore,
        detailIsCategory1: tempLocalUserHabit.detailIsCategory1,
        detailIsCategory2: tempLocalUserHabit.detailIsCategory2,
        detailIsCategory3: tempLocalUserHabit.detailIsCategory3,
        detailCode: tempLocalUserHabit.detailCode,
        detailDateEndUTCString: tempLocalUserHabit.detailDateEndUTCString,
        detailDateStartUTCString: tempLocalUserHabit.detailDateStartUTCString,
        detailDuration: tempLocalUserHabit.detailDuration,
        detailDescription: tempLocalUserHabit.detailDescription,
        detailIsNewHabit: tempLocalUserHabit.detailIsNewHabit,
        detailTitle: tempLocalUserHabit.detailTitle,
        checks: tempLocalUserHabit.checks,
        messages: tempLocalUserHabit.messages,
        reflectComment: tempLocalUserHabit.reflectComment,
        reflectDifficulty: tempLocalUserHabit.reflectDifficulty,
        reflectIsSuccessful: tempLocalUserHabit.reflectIsSuccessful,
        reflectRecommend: tempLocalUserHabit.reflectRecommend
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
        newHabitData[$currentActiveHabit] = res.updatedHabit;
        activeUserHabits.set(newHabitData);
        isNewActiveUserHabit.set(true);
      })
      .catch(err => {
        console.clear();
        errMessage.set(err);
        push(`/error`);
      });
  };
</script>

<!-- <AppHeader>
  <TwentyTwentyOne />
</AppHeader> -->

<AddEditDeleteHabit
  {tempLocalUserHabit}
  actionTitle="Update Habit"
  handleSubmit={handleSubmitEditExistingHabit}
  altActionTitle="Delete"
  handleAltAction={handleDelete} />

{#if habitDeleteWarning}
  <Modal contentModal={contentModalDelete}>
    <button
      on:click={handleModalDeleteAction}
      type="button"
      class="inline-flex justify-center w-full rounded-md border
      border-transparent shadow-sm px-4 py-2 bg-blue-900 text-base font-medium
      text-white hover:bg-blue-500 focus:outline-none focus:ring-2
      focus:ring-offset-2 focus:ring-blue-700 sm:text-sm">
      {contentModalDelete.button}
    </button>
  </Modal>
{/if}
