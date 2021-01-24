<script>
  import { fade } from "svelte/transition";
</script>

<div in:fade local class="mt-8 mb-2 mx-5 sm:mx-auto sm:w-full sm:max-w-md">
  <div class="bg-white py-8 px-4 shadow rounded-sm sm:rounded-lg sm:px-10">
    <slot />
  </div>
</div>
