<script>
  import { onMount } from "svelte";
  import {
    errMessage,
    API_ENDPOINT,
    currentActiveHabit,
    getUserHabitBlank,
    isNewActiveUserHabitChange,
    adminIdUser,
    userProfile,
    userHabitsActive
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
      adminActivePosition: $currentActiveHabit,
      adminIdUser: $adminIdUser
    });

    const fetchURL = $API_ENDPOINT + `/habits/${$adminIdUser}`;
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
        userProfile.set(res.userDetails);
        let newHabitData = $userHabitsActive;
        newHabitData[$currentActiveHabit] = res.newHabit;
        userHabitsActive.set(newHabitData);
        isNewActiveUserHabitChange.set(true);
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
