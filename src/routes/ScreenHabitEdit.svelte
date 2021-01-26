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
    tempUserHabit
  } from "../stores.js";
  import { push } from "svelte-spa-router";
  import AppHeader from "../components/AppHeader.svelte";
  import TwentyTwentyOne from "../svg/2021.svelte";
  import Modal from "../components/Modal.svelte";
  import AddEditDeleteHabit from "../components/AddEditDeleteHabit.svelte";

  let contentModal = {
    title: "Are You Sure You Want to Delete?",
    details: "You will lose all data associated with this habit.",
    button: "Delete Habit Data"
  };

  const handleModal = async () => {
    const fetchURL = $API_ENDPOINT + "/deleteExistingHabit";
    const fetchOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },

      body: JSON.stringify({
        adminHabitId: $tempUserHabit.adminHabitId
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
        newHabitData[$currentActiveHabit] = $getUserHabitBlank();
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
        adminIsActive: $tempUserHabit.adminIsActive,
        adminUserId: $activeUserId,
        adminHabitId: $tempUserHabit.adminHabitId,
        adminSeriesId: $tempUserHabit.adminSeriesId,
        adminScore: $tempUserHabit.adminScore,
        adminIsSuccessful: $tempUserHabit.adminIsSuccessful,
        detailIsCategory1: $tempUserHabit.detailIsCategory1,
        detailIsCategory2: $tempUserHabit.detailIsCategory2,
        detailIsCategory3: $tempUserHabit.detailIsCategory3,
        detailCode: $tempUserHabit.detailCode,
        detailDateEndUTCString: $tempUserHabit.detailDateEndUTCString,
        detailDateStartUTCString: $tempUserHabit.detailDateStartUTCString,
        detailDuration: $tempUserHabit.detailDuration,
        detailDescription: $tempUserHabit.detailDescription,
        detailIsNewHabit: $tempUserHabit.detailIsNewHabit,
        detailTitle: $tempUserHabit.detailTitle,
        checks: $tempUserHabit.checks,
        messages: $tempUserHabit.messages
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
  altActionTitle="Delete"
  handleAltAction={handleDelete}
  handleSubmit={handleSubmitEditExistingHabit} />

{#if habitDeleteWarning}
  <Modal {handleModal} {contentModal} />
{/if}
