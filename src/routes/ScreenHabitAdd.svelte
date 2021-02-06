<script>
  import { onMount } from "svelte";
  import {
    errMessage,
    API_ENDPOINT,
    indexActiveHabit,
    getUserHabitBlank,
    userId,
    userProfile,
    userHabitsActive,
    isLSDataOutdated
  } from "../stores.js";
  import { push } from "svelte-spa-router";
  import AppHeader from "../components/AppHeader.svelte";
  import TwentyTwentyOne from "../svg/2021.svelte";
  import HabitFormAddEditDelete from "../components/HabitFormAddEditDelete.svelte";
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AppHeaderLocalScore from "../components/AppHeaderLocalScore.svelte";
  import AppHeaderLocalTitle from "../components/AppHeaderLocalTitle.svelte";

  let tempLocalUserHabit = $getUserHabitBlank();
  tempLocalUserHabit.detailIsNewHabit = true;

  const handleReset = () => {
    tempLocalUserHabit = $getUserHabitBlank();
  };

  const handleSubmitCreateNewHabit = async () => {
    Object.assign(tempLocalUserHabit, {
      adminActivePosition: $indexActiveHabit,
      adminIdUser: $userId
    });

    const fetchURL = $API_ENDPOINT + `/habits/${$userId}`;
    const fetchOptions = {
      method: "POST",
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
        userProfile.set(res.userDetails);
        let newHabitData = $userHabitsActive;
        newHabitData[$indexActiveHabit] = res.newHabit;
        userHabitsActive.set(newHabitData);
        isLSDataOutdated.set(true);
      })
      .catch(err => {
        // console.clear();
        errMessage.set(err);
        push(`/error`);
      });
  };
</script>

<!-- <AppHeader>
  <TwentyTwentyOne />
</AppHeader> -->

<ContentWrapper>
  <div>
    <AppHeaderLocalScore />
    <AppHeaderLocalTitle
      title={'Add Habit'}
      subtitle={'Fill out this form to add'} />
    <div class="mt-6">
      <HabitFormAddEditDelete
        {tempLocalUserHabit}
        actionTitle="Create Habit"
        handleSubmit={handleSubmitCreateNewHabit}
        altActionTitle="Reset"
        handleAltAction={handleReset} />
    </div>
  </div>
</ContentWrapper>
