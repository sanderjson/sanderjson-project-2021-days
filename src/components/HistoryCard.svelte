<script>
  export let habit;
</script>

<div
  class="mx-auto flex py-1 border-2 border-blue-100 shadow rounded-sm bg-white
  hover:bg-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-900
  focus:outline-none transition-colors duration-75">
  <div
    on:click={() => console.log('Habit button clicked')}
    class="w-1/3 py-1 px-2 ">
    <div class="flex flex-col mx-auto">
      <div
        class="relative uppercase font-extrabold text-gray-900 text-xs text-left">
        {#if habit.detailDuration > 86400}
          {habit.detailDuration / 86400} days
        {:else if habit.detailDuration == 86400}
          24 hours
        {:else if habit.detailDuration > 3600}
          {habit.detailDuration / 3600} hours
        {:else if habit.detailDuration == 3600}
          60 mins
        {:else if habit.detailDuration > 60}
          {habit.detailDuration / 60} mins
        {:else}1 min{/if}
      </div>
      <div
        class="relative mt-1 text-6xl font-extrabold text-center text-blue-900">
        {#if habit.detailCode}{habit.detailCode}{:else}+{/if}
      </div>

      <div
        class="relative mt-2 text-sm font-bold text-center text-gray-900
        uppercase">
        {#if habit.reflectIsSuccessful}
          <span class="bg-green-100 text-green-700 py-1 px-2 rounded-sm">
            success
          </span>
        {:else if habit.reflectIsSuccessful == null}
          <span class="bg-blue-100 text-blue-700 px-2 rounded-sm">active</span>
        {:else}
          <span class="bg-red-100 text-red-700 px-2 rounded-sm">fail</span>
        {/if}
      </div>

    </div>
  </div>
  <div class="w-full">
    <div
      class="ml-2 pl-2 pt-3 ltext-xs font-extrabold text-gray-900 uppercase
      text-left">
      {habit.detailTitle}
    </div>
    <div
      class="ml-2 pl-2 pt-0 text-xs font-extrabold text-gray-500 uppercase
      text-left">
      Start: {habit.adminDateEndUTCString.slice(0, 16)}
    </div>
    <div
      class="ml-2 pl-2 text-xs font-extrabold text-gray-500 uppercase text-left">
      End: {habit.adminDateStartUTCString.slice(0, 16)}
    </div>
    <ul
      class="ml-2 pt-1 place-items-center grid grid-cols-8 grid-cols-2 w-4/5
      leading-tight">
      {#each habit.checks as check, i}
        {#if i < 15}
          <li>
            {#if check.isOk}
              <i class="bg-green-100 far fa-1x fa-check-square" />
            {:else}
              <i class="bg-red-100 far fa-1x fa-window-close" />
            {/if}
          </li>
        {/if}
        {#if i === 15}
          <div
            class="w-full text-xs font-extrabold text-gray-900 uppercase
            text-center">
            ...
          </div>
        {/if}
      {/each}
    </ul>
  </div>
</div>
