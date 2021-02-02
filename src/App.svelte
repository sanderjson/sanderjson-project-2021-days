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
    userProfile,
    userHabitsActive,
    userHabitsHistory,
    isActiveHabitComplete,
    adminIdUser,
    isNewDataLoaded
  } from "./stores.js";
  import {
    LSisUserDefined,
    LSuserAuth,
    LSuserProfile,
    LSuserHabitsActive,
    LSuserHabitsHistory
  } from "./localStorage.js";

  // loads user profile from local storage
  isLocalStorage.set($getIsLocalStorage());
  if ($isLocalStorage && $LSisUserDefined) {
    adminIdUser.set($LSuserProfile.adminIdUser);
    userProfile.set($LSuserProfile);
    let activeHabitsClean = $LSuserHabitsActive;
    while (activeHabitsClean.length < 3) {
      activeHabitsClean.push(null);
    }
    userHabitsActive.set(activeHabitsClean);
    userHabitsHistory.set($LSuserHabitsHistory);

    // console.log("$LSuserAuth", $LSuserAuth);
    // console.log("$LSuserProfile", $LSuserProfile);
    // console.log("$LSuserHabitsActive", $LSuserHabitsActive);
    // console.log("$adminIdUser", $adminIdUser);
    replace("/");
  } else {
    replace("/start");
  }

  const updateLocalStorage = () => {
    if ($isLocalStorage) {
      LSuserAuth.set($activeUserAuth);
      LSuserProfile.set($userProfile);
      LSuserHabitsActive.set($userHabitsActive);
      LSuserHabitsHistory.set($userHabitsHistory);
      LSisUserDefined.set(true);
    }
    $isNewActiveUserHabitChange ? isNewActiveUserHabitChange.set(false) : "";
    $isActiveHabitComplete ? isActiveHabitComplete.set(false) : "";
    $isNewDataLoaded ? isNewDataLoaded.set(false) : "";

    replace("/");
  };

  const updateLocalStorageWithoutRouteChange = () => {
    if ($isLocalStorage) {
      LSuserAuth.set($activeUserAuth);
      LSuserProfile.set($userProfile);
      LSuserHabitsActive.set($userHabitsActive);
      LSuserHabitsHistory.set($userHabitsHistory);
      LSisUserDefined.set(true);
    }
    $isNewActiveUserHabitChange ? isNewActiveUserHabitChange.set(false) : "";
    $isActiveHabitComplete ? isActiveHabitComplete.set(false) : "";
    $isNewDataLoaded ? isNewDataLoaded.set(false) : "";
  };

  $: $isActiveUserLive == true ? updateLocalStorage() : "";
  $: $isNewActiveUserHabitChange == true ? updateLocalStorage() : "";
  $: isActiveHabitComplete == true ? updateLocalStorage() : "";
  $: $isNewDataLoaded == true ? updateLocalStorageWithoutRouteChange() : "";

  $: console.log("$adminIdUser", $adminIdUser);
  $: console.log("$userProfile", $userProfile);
  $: console.log("$userHabitsActive", $userHabitsActive);
  $: console.log("$userHabitsHistory", $userHabitsHistory);

  onDestroy(() => {
    isActiveUserLive.set(false);
  });
</script>

<div
  class="bg-repeat h-screen w-screen overflow-x-hidden relative"
  style="background-image: url(/static/subtle-bg/greek-vase.png)">
  <Router {routes} />
</div>
