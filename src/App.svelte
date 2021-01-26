<script>
  import { onDestroy } from "svelte";
  import Router from "svelte-spa-router";
  import { replace } from "svelte-spa-router";
  import routes from "./routes";
  import {
    getIsLocalStorage,
    isLocalStorage,
    isActiveUserLive,
    isNewActiveUserHabit,
    activeUserAuth,
    activeUserId,
    activeUserDetails,
    activeUserHabits,
    getUserHabitBlank
  } from "./stores.js";
  import {
    LSisUserDefined,
    LSuserAuth,
    LSuserDetails,
    LSactiveHabits
  } from "./localStorage.js";

  // loads user profile from local storage
  isLocalStorage.set($getIsLocalStorage());
  if ($isLocalStorage && $LSisUserDefined) {
    activeUserId.set($LSuserDetails.userId);
    activeUserDetails.set($LSuserDetails);

    let activeHabitsClean = $LSactiveHabits.map(habit => {
      if (habit === null) {
        return $getUserHabitBlank();
      } else {
        return habit;
      }
    });

    while (activeHabitsClean.length < 3) {
      activeHabitsClean.push($getUserHabitBlank());
    }
    
    activeUserHabits.set(activeHabitsClean);
    replace("/");
  } else {
    replace("/start");
  }

  const updateLocalStorage = () => {
    if ($isLocalStorage) {
      LSuserAuth.set($activeUserAuth);
      LSuserDetails.set($activeUserDetails);
      LSactiveHabits.set($activeUserHabits);
      LSisUserDefined.set(true);
    }
    isNewActiveUserHabit.set(false);
    replace("/");
  };

  $: $isActiveUserLive == true ? updateLocalStorage() : "";
  $: $isNewActiveUserHabit == true ? updateLocalStorage() : "";
  console.log("$activeUserHabits", $activeUserHabits);

  onDestroy(() => {
    isActiveUserLive.set(false);
  });
</script>

<div
  class="bg-repeat h-screen w-screen overflow-x-hidden relative"
  style="background-image: url(/static/subtle-bg/greek-vase.png)">
  <Router {routes} />
</div>
