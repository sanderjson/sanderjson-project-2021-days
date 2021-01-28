<script>
  import { onMount } from "svelte";
  import {
    errMessage,
    API_ENDPOINT,
    currentActiveHabit,
    getUserHabitBlank,
    isNewActiveUserHabit,
    activeUserId,
    activeUserDetails,
    activeUserHabits
  } from "../stores.js";
  import { push } from "svelte-spa-router";
  import AppHeader from "../components/AppHeader.svelte";
  import TwentyTwentyOne from "../svg/2021.svelte";
  import AddEditDeleteHabit from "../components/AddEditDeleteHabit.svelte";

  let tempLocalUserHabit = $getUserHabitBlank();

  const handleReset = () => {
    tempLocalUserHabit = $getUserHabitBlank();
  };

  const handleSubmitCreateNewHabit = async () => {
    const fetchURL = $API_ENDPOINT + "/createNewHabit";
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
</script>

<!-- <AppHeader>
  <TwentyTwentyOne />
</AppHeader> -->

<AddEditDeleteHabit
  {tempLocalUserHabit}
  actionTitle="Create Habit"
  handleSubmit={handleSubmitCreateNewHabit}
  altActionTitle="Reset"
  handleAltAction={handleReset} />
