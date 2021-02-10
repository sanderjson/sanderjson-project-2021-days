<script>
  import { onMount } from "svelte";
  import {
    contentHabitDetailCategory,
    contentHabitDuration
  } from "../stores.js";
  import { push } from "svelte-spa-router";
  import ContentWrapper from "./ContentWrapper.svelte";
  import AppHeader from "./AppHeader.svelte";
  import TwentyTwentyOne from "../svg/2021.svelte";
  import HabitCardInfoLeader from "./HabitCardInfoLeader.svelte";
  import HabitCard from "./HabitCard.svelte";

  export let tempLocalUserProfile;
  export let actionTitle;
  export let altActionTitle;
  export let handleAltAction;
  export let handleSubmit;

  const handleLocalSubmit = () => {
    handleSubmit();
  };
</script>

<form class="space-y-6" on:submit|preventDefault={handleSubmit}>
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
      {actionTitle}
    </button>
  </div>
</form>

<div class="mt-6">
  <div class="relative">
    <div class="absolute inset-0 flex items-center">
      <div class="w-full border-t border-gray-300" />
    </div>
    <div class="relative flex justify-center text-sm">
      <span class="px-2 bg-white text-gray-900">Or</span>
    </div>
  </div>

  <div class="mt-6 grid grid-cols-2 gap-3">
    <div>
      <button
        on:click={() => push('/')}
        class="w-full inline-flex justify-center py-2 px-4 border
        border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium
        text-gray-900 hover:bg-gray-50">
        <span class="">Back</span>
      </button>
    </div>
    <div>
      <button
        on:click={handleAltAction}
        class="w-full inline-flex justify-center py-2 px-4 border
        border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium
        text-gray-900 hover:bg-gray-50">
        <span class="">{altActionTitle}</span>
      </button>
    </div>
  </div>

</div>
