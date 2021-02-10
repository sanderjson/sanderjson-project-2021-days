<script>
  import { fade } from "svelte/transition";
</script>

<div in:fade local class="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
  <div class="mx-auto mt-12 sm:mt-16 w-48 sm:w-64">
    <slot />
  </div>
  <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
    Micro Habit Challenge
  </h2>
  <div class="mt-2 text-center text-sm text-gray-600 max-w">
    <p class="font-bold text-blue-900 ">Take a goal and make it a habit</p>
  </div>
</div>
