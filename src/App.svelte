<script>
  import Router from "svelte-spa-router";
  import routes from "./routes";
  import { replace } from "svelte-spa-router";
  import { onDestroy } from "svelte";
  import {
    userId,
    userAuth,
    userProfile,
    userHabitsActive,
    userHabitsHistory,
    isLSDataOutdated,
    isDataOutdatedHistory,
    isLocalStorage,
    getIsLocalStorage
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
    userId.set($LSuserProfile.adminIdUser);
    userProfile.set($LSuserProfile);
    let activeHabitsClean = $LSuserHabitsActive;
    while (activeHabitsClean.length < 3) {
      activeHabitsClean.push(null);
    }
    userHabitsActive.set(activeHabitsClean);
    userHabitsHistory.set($LSuserHabitsHistory);
    replace("/");
  } else {
    replace("/start");
  }

  const updateLocalStorage = () => {
    if ($isLocalStorage) {
      LSuserAuth.set($userAuth);
      LSuserProfile.set($userProfile);
      LSuserHabitsActive.set($userHabitsActive);
      LSuserHabitsHistory.set($userHabitsHistory);
      LSisUserDefined.set(true);
    }
    $isLSDataOutdated ? isLSDataOutdated.set(false) : "";
    $isDataOutdatedHistory ? isDataOutdatedHistory.set(false) : "";
  };

  const updateLSAndRouteHome = () => {
    updateLocalStorage();
    replace("/");
  };

  $: $isLSDataOutdated == true ? updateLSAndRouteHome() : "";
  $: $isDataOutdatedHistory == true ? updateLocalStorage() : "";

  // $: console.log("$userId", $userId);
  // $: console.log("$userProfile", $userProfile);
  // $: console.log("$userHabitsActive", $userHabitsActive);
  // $: console.log("$userHabitsHistory", $userHabitsHistory);
  // $: console.log("$isLSDataOutdated", $isLSDataOutdated);

  onDestroy(() => {
    isLSDataOutdated.set(false);
  });
</script>

<div
  class="bg-repeat h-screen w-screen overflow-x-hidden relative"
  style="background-image: url(/static/subtle-bg/greek-vase.png)">
  <Router {routes} />
</div>
