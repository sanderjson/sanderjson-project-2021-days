<script>
  import ButtonPassword from "../components/ButtonPassword.svelte";
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import { push, pop, replace } from "svelte-spa-router";
  import { activeUser, isSignedIn, errMessage } from "../stores.js";

  let userInputEmail, userInputPassword;

  const handleSignIn = async () => {
    const fetchURL =
      "https://sanderjson-pr-2021-days.builtwithdark.com/signInUser";

    const fetchOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email: userInputEmail.toLocaleLowerCase(),
        password: userInputPassword
      })
    };

    const postData = await fetch(fetchURL, fetchOptions)
      .then(res => res.json())
      .then(res => {
        if (res.Error) {
          errMessage.set(res.Error);
          push(`#/error`);
        } else {
          activeUser.set({ ...res });
          isSignedIn.set(true);
        }
      })
      .catch(err => {
        console.error(err);
      });

    if ($isSignedIn) {
      console.log("activeUser from fetch", $activeUser);
      replace(`#/user/${$activeUser.id}`);
    }
  };
</script>

<div
  class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6
  lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <img
      class="mx-auto h-12 w-auto"
      src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
      alt="Workflow" />
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
      2021 Day Challenge
    </h2>
    <div class="mt-2 text-center text-sm text-gray-600 max-w">
      <p class="font-medium text-indigo-600 hover:text-indigo-500">
        The year your someday became a reality
      </p>
    </div>
  </div>

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
            bind:value={userInputEmail}
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
            bind:value={userInputPassword}
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
          hover:bg-indigo-700 focus:outline-none focus:ring-2
          focus:ring-offset-2 focus:ring-indigo-500">
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
            href="#/start"
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

</div>
