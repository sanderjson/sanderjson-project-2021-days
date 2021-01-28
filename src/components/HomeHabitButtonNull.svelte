<script>
  import { currentActiveHabit } from "../stores.js";
  import { push } from "svelte-spa-router";

  export let i;

  const handleClick = () => {
    currentActiveHabit.set(i);
  };

  const handleHabitAdd = () => {
    push("/add");
  };
</script>

<style>
  .selected {
    @apply bg-blue-100;
  }
</style>

<div class="flex flex-col">
  <button
    class:selected={$currentActiveHabit === i || ($currentActiveHabit === null && !habit.adminIsActive)}
    on:click={handleClick}
    class="bg-white py-1 px-2 border-2 border-blue-100 shadow rounded-sm
    hover:bg-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700
    focus:outline-none transition-colors duration-75">
    <div class="flex flex-col mx-auto">
      <div class="uppercase font-extrabold text-gray-900 text-xs text-left">
        Time
      </div>
      <div class="mt-1 text-6xl font-extrabold text-center text-blue-900">
        +
      </div>
      <div class="mt-2 text-sm font-bold text-center text-gray-500 uppercase">
        info
      </div>
    </div>
  </button>

  <div class="bg-white mt-2 shadow rounded-sm sm:rounded-lg sm:px-10">
    {#if $currentActiveHabit === i}
      <div class="py-1 flex justify-center items-center space-x-2">
        <button
          style="height: 32px"
          on:click={handleHabitAdd}
          class="flex justify-center items-center focus:ring-1 outline-none
          focus:ring-offset-1 focus:ring-green-500 focus:outline-none
          transition-colors duration-75">
          <span
            class="border-2 rounded-sm border-black bg-green-100 p-1 text-xs
            font-extrabold align-middle">
            ADD
          </span>
        </button>
      </div>
    {/if}
  </div>
</div>
