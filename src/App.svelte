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
    isDataOutdatedUserDelete,
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
  import Twitter from "./svg/social-twitter.svelte";
  import LinkedIn from "./svg/social-linkedin.svelte";

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
    $isDataOutdatedUserDelete ? isDataOutdatedUserDelete.set(false) : "";
  };

  const updateLSAndRouteHome = () => {
    updateLocalStorage();
    replace("/");
  };

  const updateLSAndRouteStart = () => {
    updateLocalStorage();
    replace("/start");
  };

  $: $isLSDataOutdated == true ? updateLSAndRouteHome() : "";
  $: $isDataOutdatedHistory == true ? updateLocalStorage() : "";
  $: $isDataOutdatedHistory == true ? updateLocalStorage() : "";
  $: $isDataOutdatedUserDelete == true ? updateLSAndRouteStart() : "";

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
  <div class="fixed inset-0 sm:inset-2 lg:inset-8 bg-white opacity-40" />

  <main>
    <Router {routes} />
  </main>

  <footer class="fixed mt-12 sm:mb-4 bottom-0 w-full sm:relative z-0">
    <div
      class="container mx-auto sm:max-w-xl py-1 sm:py-5 px-5 relative z-100
      bg-gray-300 text-sm text-gray-500 font-medium sm:rounded ">
      <div class="flex justify-between items-center ">
        <p
          class="hover:text-blue-900 transition-colors duration-150
          cursor-pointer">
          Built by
          <span class="font-bold">Jonathan Sanderson</span>
        </p>
        <div class="align-middle h-full">
          <a
            class="inline-flex justify-center align-middle fill-current w-4 h-4
            hover:text-blue-900 transition-colors duration-150"
            target="_blank"
            href="https://twitter.com/sanderjson">
            <Twitter />
          </a>
          <a
            class="inline-flex justify-center align-middle fill-current w-4 h-4
            hover:text-blue-900 transition-colors duration-150"
            target="_blank"
            href="https://linkedin.com/in/sandersonjma">
            <LinkedIn />
          </a>
        </div>
      </div>
    </div>
  </footer>

</div>
