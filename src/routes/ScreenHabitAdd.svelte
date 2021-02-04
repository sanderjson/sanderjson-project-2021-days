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
  import AddEditDeleteHabit from "../components/AddEditDeleteHabit.svelte";

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

<AddEditDeleteHabit
  {tempLocalUserHabit}
  actionTitle="Create Habit"
  handleSubmit={handleSubmitCreateNewHabit}
  altActionTitle="Reset"
  handleAltAction={handleReset} />
