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
    getUserHabitBlank,
    activeUserAuth,
    activeUserId,
    activeUserDetails,
    activeUserHabits,
    isActiveUserLive
  } from "../stores.js";

  const userProfileTemp = $getUserProfileBlank();

  const handleSignUp = async () => {
    const fetchURL = $API_ENDPOINT + "/createNewUser";

    const fetchOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },

      body: JSON.stringify({
        name: userProfileTemp.name,
        email: userProfileTemp.email.toLocaleLowerCase(),
        title: userProfileTemp.title,
        initials: userProfileTemp.initials,
        password: userProfileTemp.password,
        userScore: userProfileTemp.userScore,
        isAccountPrivate: userProfileTemp.isAccountPrivate,
        socialAccounts: userProfileTemp.socialAccounts,
        habitActiveIds: userProfileTemp.habitActiveIds,
        habitHistoryIds: userProfileTemp.habitHistoryIds,
        userId: userProfileTemp.userId,
        podId: userProfileTemp.podId,
        imageId: userProfileTemp.imageId,
        signUpDate: userProfileTemp.signUpDate
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
        let activeHabitsClean = res.userActiveHabits.map(habit => {
          if (habit == null) {
            return $getUserHabitBlank();
          }
          return habit;
        });
        activeUserAuth.set(res.userAuth);
        activeUserDetails.set(res.userDetails);
        activeUserId.set(res.userDetails.userId);
        activeUserHabits.set(activeHabitsClean);
        isActiveUserLive.set(true);
      })
      .catch(err => {
        console.clear();
        errMessage.set(err);
        push(`/error`);
      });
  };

  onMount(() => {
    userProfileTemp.signUpDate = new Date();
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
          bind:value={userProfileTemp.name}
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
          bind:value={userProfileTemp.initials}
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
          bind:value={userProfileTemp.title}
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
          bind:value={userProfileTemp.email}
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
          bind:value={userProfileTemp.password}
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
