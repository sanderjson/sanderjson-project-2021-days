<script>
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AppHeader from "../components/AppHeader.svelte";
  import TwentyTwentyOne from "../svg/2021.svelte";

  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";
  import {
    errMessage,
    API_ENDPOINT,
    contentHabitDetailCategory,
    getUserProfileBlank,
    userAuth,
    userId,
    userProfile,
    userHabitsActive,
    isDataOutdated
  } from "../stores.js";

  let tempLocalUserProfile = $getUserProfileBlank();

  const handleSignUp = async () => {
    Object.assign(tempLocalUserProfile, {
      detailEmail: tempLocalUserProfile.detailEmail.toLocaleLowerCase()
    });

    const fetchURL = $API_ENDPOINT + "/users";

    const fetchOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },

      body: JSON.stringify({
        ...tempLocalUserProfile
      })
    };

    const handleErrors = res => {
      if (!res.ok) {
        return res.text().then(text => {
          throw text;
        });
      }
      return res.json();
    };

    const postData = await fetch(fetchURL, fetchOptions)
      .then(handleErrors)
      .then(res => {
        // console.log("res", res);
        userAuth.set(res.userAuth);
        userProfile.set(res.userDetails);
        userId.set(res.userDetails.userId);
        userHabitsActive.set([{}, {}, {}]);
        isDataOutdated.set(true);
      })
      .catch(err => {
        console.clear();
        errMessage.set(err);
        push(`/error`);
      });
  };

  onMount(() => {
    tempLocalUserProfile.adminDateCreated = new Date();
  });
</script>

<AppHeader>
  <TwentyTwentyOne />
</AppHeader>

<ContentWrapper>
  <form class="space-y-6" on:submit|preventDefault={handleSignUp}>
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700">
        Name
      </label>
      <div class="mt-1">
        <input
          bind:value={tempLocalUserProfile.detailName}
          id="name"
          name="name"
          type="name"
          autocomplete="name"
          required
          placeholder="Jane Doe"
          class="appearance-none block w-full px-3 py-2 border border-gray-300
          rounded-md shadow-sm placeholder-gray-400 focus:outline-none
          focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
      </div>
    </div>

    <div>
      <label for="initials" class="block text-sm font-medium text-gray-700">
        Initials
      </label>
      <div class="mt-1">
        <input
          bind:value={tempLocalUserProfile.detailInitials}
          id="initials"
          name="initials"
          type="initials"
          autocomplete="initials"
          required
          placeholder="JD"
          class="appearance-none block w-full px-3 py-2 border border-gray-300
          rounded-md shadow-sm placeholder-gray-400 focus:outline-none
          focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
      </div>
    </div>

    <div>
      <label for="title" class="block text-sm font-medium text-gray-700">
        Title
      </label>
      <div class="mt-1">
        <input
          bind:value={tempLocalUserProfile.detailTitle}
          id="title"
          name="title"
          type="title"
          autocomplete="title"
          required
          placeholder="Guardian of the Galaxy"
          class="appearance-none block w-full px-3 py-2 border border-gray-300
          rounded-md shadow-sm placeholder-gray-400 focus:outline-none
          focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
      </div>
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">
        Email
      </label>
      <div class="mt-1">
        <input
          bind:value={tempLocalUserProfile.detailEmail}
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          required
          placeholder="janedoe@domain.com"
          class="appearance-none block w-full px-3 py-2 border border-gray-300
          rounded-md shadow-sm placeholder-gray-400 focus:outline-none
          focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
      </div>
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700">
        Password
      </label>
      <div class="mt-1">
        <input
          bind:value={tempLocalUserProfile.detailPassword}
          id="password"
          name="password"
          type="password"
          autocomplete="password"
          required
          placeholder="*****"
          class="appearance-none block w-full px-3 py-2 border border-gray-300
          rounded-md shadow-sm placeholder-gray-400 focus:outline-none
          focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
      </div>
    </div>

    <div>
      <button
        type="submit"
        class="w-full flex justify-center py-2 px-4 border border-transparent
        rounded-md shadow-sm text-sm font-bold text-white bg-blue-900
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2
        focus:ring-blue-500">
        Sign Up
      </button>
    </div>
  </form>
</ContentWrapper>
