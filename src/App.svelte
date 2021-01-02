<script>
  import Router from "svelte-spa-router";
  import routes from "./routes";
  import {
    LSuserAuth,
    LSuserDetails,
    LSisUserDefined
  } from "./localStorage.js";
  import { onMount } from "svelte";

  onMount(()=> {
    console.log("LSuserAuth", $LSuserAuth);
    console.log("LSuserDetails", $LSuserDetails);
    console.log("LSisUserDefined", $LSisUserDefined);
  })
</script>

<Router {routes} />
