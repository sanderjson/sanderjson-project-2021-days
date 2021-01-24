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
    activeUserHabits
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
    console.log("writing activeUser from LS");
    activeUserId.set($LSuserDetails.userId);
    activeUserDetails.set($LSuserDetails);
    activeUserHabits.set($LSactiveHabits);
    replace("/");
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

  onDestroy(() => {
    isActiveUserLive.set(false);
  });
</script>

<div
  class="bg-repeat h-screen w-screen overflow-x-hidden relative"
  style="background-image: url(/static/subtle-bg/greek-vase.png)">
  <Router {routes} />
</div>
