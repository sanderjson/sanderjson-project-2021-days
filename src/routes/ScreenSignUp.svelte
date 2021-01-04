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

  const contentHabitsInfo = [
    {
      title: "Physical Habit",
      type: "physical",
      content:
        "Walking, running, exercise, improved posture, quit smoking, stop biting nails."
    },
    {
      title: "Learning Habit",
      type: "learning",
      content:
        "Taking a new course, reading, learning a new skill, unlearn limiting beliefs."
    },
    {
      title: "Social Habit",
      type: "social",
      content:
        "Calling friends or family, meeting new people, being more open, stop toxic patterns."
    }
  ];

  let userTemp = {
    name: "",
    email: "",
    password: "",
    habit: "",
    habitType: true,
    habitDateStartISOString: "",
    habitDateStartUTCString: "",
    habitDateEndISOString: "",
    habitDateEndUTCString: "",
    habitCategory: []
  };

  const handleSignUp = async () => {
    const fetchURL =
      "https://sanderjson-pr-2021-days.builtwithdark.com/createNewUser";

    const fetchOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        name: userTemp.name,
        email: userTemp.email.toLocaleLowerCase(),
        password: userTemp.password,
        habit: userTemp.habit,
        habitType: userTemp.habitType,
        habitCategory: userTemp.habitCategory,
        habitDateStartUTCString: userTemp.habitDateStartUTCString,
        habitDateEndUTCString: userTemp.habitDateEndUTCString
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
            console.log("signup before LSuserAuth", $LSuserAuth);
            console.log("signup before LSuserDetails", $LSuserDetails);
            console.log("signup before LSisUserDefined", $LSisUserDefined);
            LSuserAuth.set(res.userAuth);
            LSuserDetails.set(res.userDetails);
            LSisUserDefined.set(true);
            console.log("signup after LSuserAuth", $LSuserAuth);
            console.log("signup after LSuserDetails", $LSuserDetails);
            console.log("signup after LSisUserDefined", $LSisUserDefined);
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

  const handleToggleHabitType = () => {
    userTemp.habitType = !userTemp.habitType;
  };

  onMount(() => {
    tempIsUserDefined.set(false);
    LSisUserDefined.set(false);

    let dateStart = new Date();
    let dateEnd = new Date();
    dateEnd.setDate(dateEnd.getDate() + 20);

    userTemp.habitDateStartUTCString = dateStart.toUTCString();
    userTemp.habitDateEndUTCString = dateEnd.toUTCString();
    // console.log("user.habitDateStartUTCString", user.habitDateStartUTCString);
    // console.log("user.habitDateEndUTCString", user.habitDateEndUTCString);
  });
</script>

<AppHeader>
  <TwentyTwentyOne />
</AppHeader>

<ContentWrapper>
  <form class="space-y-6" on:submit|preventDefault={handleSignUp}>
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">
        Name
      </label>
      <div class="mt-1">
        <input
          bind:value={userTemp.name}
          id="name"
          name="name"
          type="name"
          autocomplete="name"
          required
          class="appearance-none block w-full px-3 py-2 border border-gray-300
          rounded-md shadow-sm placeholder-gray-400 focus:outline-none
          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">
        Email address
      </label>
      <div class="mt-1">
        <input
          bind:value={userTemp.email}
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          required
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
          bind:value={userTemp.password}
          id="password"
          name="password"
          type="password"
          autocomplete="password"
          required
          class="appearance-none block w-full px-3 py-2 border border-gray-300
          rounded-md shadow-sm placeholder-gray-400 focus:outline-none
          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700">
        Habit
      </label>
      <div class="mt-1">
        <input
          bind:value={userTemp.habit}
          id="habit"
          name="habit"
          type="habit"
          autocomplete="habit"
          required
          class="appearance-none block w-full px-3 py-2 border border-gray-300
          rounded-md shadow-sm placeholder-gray-400 focus:outline-none
          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
    </div>

    <div class="flex items-center">
      <!-- On: "bg-indigo-600", Off: "bg-gray-200" -->
      <button
        type="button"
        on:click={handleToggleHabitType}
        aria-pressed="false"
        aria-labelledby="toggleLabel"
        class:bg-indigo-600={userTemp.habitType}
        class="bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2
        border-transparent rounded-full cursor-pointer transition-colors
        ease-in-out duration-200 focus:outline-none focus:ring-2
        focus:ring-offset-2 focus:ring-indigo-500">
        <span class="sr-only">Use setting</span>
        <!-- On: "translate-x-5", Off: "translate-x-0" -->
        <span
          aria-hidden="true"
          class:translate-x-5={userTemp.habitType}
          class="translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow
          transform ring-0 transition ease-in-out duration-200" />
      </button>
      <span class="ml-3" id="toggleLabel">
        <span class="text-sm font-medium text-gray-900">
          {#if userTemp.habitType}Start a new habit{:else}Kick an old habit{/if}
        </span>
        <!-- <span class="text-sm text-gray-500">(Save 10%)</span> -->
      </span>
    </div>

    <!-- checklist -->
    <div class="mt-6">
      <fieldset>
        <legend class="block text-sm font-medium text-gray-700">
          Habit category
          <span class="text-sm text-gray-500">(check any that apply)</span>
          :
        </legend>
        <div class="mt-4 space-y-4">
          {#each contentHabitsInfo as habit}
            <div class="relative flex items-start">
              <div class="flex items-center h-5">
                <input
                  bind:group={userTemp.habitCategory}
                  value={habit.type}
                  id={habit.type}
                  name={habit.type}
                  type="checkbox"
                  class="focus:ring-indigo-500 h-4 w-4 text-indigo-600
                  border-gray-300 rounded" />
              </div>
              <div class="ml-3 text-sm">
                <label for="comments" class="font-medium text-gray-700">
                  {habit.title}
                </label>
                <p class="text-gray-500">{habit.content}</p>
              </div>
            </div>
          {/each}
        </div>
      </fieldset>
    </div>

    <div>
      <button
        type="submit"
        class="w-full flex justify-center py-2 px-4 border border-transparent
        rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600
        hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2
        focus:ring-indigo-500">
        Sign Up
      </button>
    </div>
  </form>
</ContentWrapper>
