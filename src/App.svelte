<script>
  import Router from "svelte-spa-router";
  import routes from "./routes";
  import { replace } from "svelte-spa-router";
  import { onDestroy } from "svelte";
  import {
    getIsLocalStorage,
    isLocalStorage,
    userAuth,
    userProfile,
    userHabitsActive,
    userHabitsHistory,
    userId,
    isDataOutdated
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
    userId.set($LSuserProfile.userId);
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
    $isDataOutdated ? isDataOutdated.set(false) : "";
    // replace("/");
  };

  $: $isDataOutdated == true ? updateLocalStorage() : "";

  $: console.log("$userId", $userId);
  $: console.log("$userProfile", $userProfile);
  $: console.log("$userHabitsActive", $userHabitsActive);
  $: console.log("$userHabitsHistory", $userHabitsHistory);

  onDestroy(() => {
    isDataOutdated.set(false);
  });
</script>

<div
  class="bg-repeat h-screen w-screen overflow-x-hidden relative"
  style="background-image: url(/static/subtle-bg/greek-vase.png)">
  <Router {routes} />
</div>
