<script>
  import { onDestroy } from "svelte";
  import Router from "svelte-spa-router";
  import { replace } from "svelte-spa-router";
  import routes from "./routes";
  import {
    getIsLocalStorage,
    isLocalStorage,
    isActiveUserLive,
    isNewActiveUserHabitChange,
    activeUserAuth,
    activeUserDetails,
    activeUserHabits,
    isActiveHabitComplete,
    adminIdUser
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
    adminIdUser.set($LSuserDetails.adminIdUser);
    activeUserDetails.set($LSuserDetails);
    let activeHabitsClean = $LSactiveHabits;
    while (activeHabitsClean.length < 3) {
      activeHabitsClean.push(null);
    }
    activeUserHabits.set(activeHabitsClean);
    // console.log("$LSuserAuth", $LSuserAuth);
    // console.log("$LSuserDetails", $LSuserDetails);
    // console.log("$LSactiveHabits", $LSactiveHabits);
    // console.log("$adminIdUser", $adminIdUser);
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
    $isNewActiveUserHabitChange ? isNewActiveUserHabitChange.set(false) : "";
    $isActiveHabitComplete ? isActiveHabitComplete.set(false) : "";

    replace("/");
  };

  $: $isActiveUserLive == true ? updateLocalStorage() : "";
  $: $isNewActiveUserHabitChange == true ? updateLocalStorage() : "";
  $: isActiveHabitComplete == true ? updateLocalStorage() : "";

  $: console.log("$activeUserDetails", $activeUserDetails);
  $: console.log("$activeUserHabits", $activeUserHabits);
  $: console.log("$adminIdUser", $adminIdUser);

  onDestroy(() => {
    isActiveUserLive.set(false);
  });
</script>

<div
  class="bg-repeat h-screen w-screen overflow-x-hidden relative"
  style="background-image: url(/static/subtle-bg/greek-vase.png)">
  <Router {routes} />
</div>
