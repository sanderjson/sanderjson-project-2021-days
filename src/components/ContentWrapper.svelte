<script>
  import { fade } from "svelte/transition";
</script>

<div in:fade class="relative z-10 container mx-auto ">
  <div
    class="sm:mx-4 lg:mx-12 my-4 sm:my-6 lg:my-8 sm:py-4 lg:py-8 bg-gray-100
    sm:rounded-lg lg:rounded-2xl bg-opacity-50">
    <div
      class="py-2 sm:py-4 lg:py-6 px-5 max-w-xl mx-auto bg-white sm:shadow-lg
      lg:shadow-xl sm:rounded relative">
      <div class=" sm:mx-auto sm:w-full sm:max-w-md lg:max-w-xl">
        <slot />
      </div>
    </div>
  </div>
</div>
