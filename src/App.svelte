<script>
  import Router from "svelte-spa-router";
  import routes from "./routes";
  import { replace } from "svelte-spa-router";

  import {
    tempIsUserDefined,
    tempUserDetails,
    activeUserDetails
  } from "./stores.js";
  import {
    LSuserAuth,
    LSuserDetails,
    LSisUserDefined
  } from "./localStorage.js";
  import { onMount } from "svelte";

  const setActiveUser = () => {
    if ($LSisUserDefined) {
      $activeUserDetails = $LSuserDetails;
      // console.log("local storage user active");
    } else if ($tempIsUserDefined) {
      $activeUserDetails = $tempUserDetails;
      // console.log("temporary user active");
    } else {
      // console.log("no user defined directing to /#start");
      replace("/start");
    }
  };

  onMount(() => {
    setActiveUser();
    // console.log("LSuserAuth", $LSuserAuth);
    // console.log("LSuserDetails", $LSuserDetails);
    // console.log("LSisUserDefined", $LSisUserDefined);
  });

  $: $tempUserDetails ? setActiveUser() : "";
</script>

<div
  class="bg bg-repeat h-screen w-screen overflow-x-hidden relative"
  style="background-image: url(/static/subtle-bg/greek-vase.png)">
  <Router {routes} />
</div>
