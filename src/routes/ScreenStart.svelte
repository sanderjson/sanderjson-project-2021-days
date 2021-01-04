<script>
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AppHeader from "../components/AppHeader.svelte";
  import TwentyTwentyOne from "../svg/2021.svelte";

  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";
  import {
    tempIsUserDefined,
    tempUserDetails,
    isLocalStorage,
    errMessage
  } from "../stores.js";
  import {
    LSisUserDefined,
    LSuserAuth,
    LSuserDetails
  } from "../localStorage.js";
  let userTemp = {
    email: "",
    password: ""
  };

  const handleSignIn = async () => {
    const fetchURL =
      "https://sanderjson-pr-2021-days.builtwithdark.com/signInUser";

    const fetchOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email: userTemp.email.toLocaleLowerCase(),
        password: userTemp.password
      })
    };

    const postData = await fetch(fetchURL, fetchOptions)
      .then(res => res.json())
      .then(res => {
        if (res.Error) {
          errMessage.set(res.Error);
          push(`#/error`);
        } else {
          if ($isLocalStorage()) {
            console.log("start before LSuserAuth", $LSuserAuth);
            console.log("start before LSuserDetails", $LSuserDetails);
            console.log("start before LSisUserDefined", $LSisUserDefined);
            LSuserAuth.set(res.userAuth);
            LSuserDetails.set(res.userDetails);
            LSisUserDefined.set(true);
            console.log("start after LSuserAuth", $LSuserAuth);
            console.log("start after LSuserDetails", $LSuserDetails);
            console.log("start after LSisUserDefined", $LSisUserDefined);
            // console.log("local storage is enabled");
          } else {
            tempUserDetails.set(res.userDetails);
            tempIsUserDefined.set(true);
            // console.log("local storage is not available");
          }
        }
      })
      .catch(err => {
        errMessage.set(res.Error);
        push(`#/error`);
      });
  };

  onMount(() => {
    tempIsUserDefined.set(false);
    LSisUserDefined.set(false);
  });
</script>

<AppHeader>
  <TwentyTwentyOne />
</AppHeader>

<ContentWrapper>
  <form class="space-y-6" on:submit|preventDefault={handleSignIn}>
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">
        Email address
      </label>
      <div class="mt-1">
        <input
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          required
          bind:value={userTemp.email}
          class="appearance-none block w-full px-3 py-2 border border-gray-300
          rounded-md shadow-sm placeholder-gray-400 focus:outline-none
          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700">
        Password
      </label>
      <div class="mt-1">
        <input
          id="password"
          name="password"
          type="password"
          autocomplete="password"
          required
          bind:value={userTemp.password}
          class="appearance-none block w-full px-3 py-2 border border-gray-300
          rounded-md shadow-sm placeholder-gray-400 focus:outline-none
          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
    </div>

    <div>
      <button
        type="submit"
        class="w-full flex justify-center py-2 px-4 border border-transparent
        rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600
        hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2
        focus:ring-indigo-500">
        Sign in
      </button>
    </div>
  </form>

  <div class="mt-6">
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-300" />
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-2 bg-white text-gray-500">Or</span>
      </div>
    </div>

    <div class="mt-6 grid grid-cols-2 gap-3">
      <div>
        <a
          href="#/signup"
          class="w-full inline-flex justify-center py-2 px-4 border
          border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium
          text-gray-500 hover:bg-gray-50">
          <span class="">Sign Up</span>
        </a>
      </div>

      <div>
        <a
          href="#/about"
          class="w-full inline-flex justify-center py-2 px-4 border
          border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium
          text-gray-500 hover:bg-gray-50">
          <span class="">Learn More</span>
        </a>
      </div>

    </div>
  </div>
</ContentWrapper>
