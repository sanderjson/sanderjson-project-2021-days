<script>
  export let duration;
  export let code;
  export let leaders;

  import HabitCardInfoLeader from "./HabitCardInfoLeader.svelte";
</script>

<div class="flex flex-col mx-auto">
  <div
    class="relative uppercase font-extrabold text-gray-900 text-xs text-left">
    {#if duration > 86400}
      {duration / 86400} days
    {:else if duration == 86400}
      24 hours
    {:else if duration > 3600}
      {duration / 3600} hours
    {:else if duration == 3600}
      60 mins
    {:else if duration > 60}{duration / 60} mins{:else}1 min{/if}
    {#if leaders}
      <HabitCardInfoLeader short={false} text={leaders[0]} />
    {/if}
  </div>
  <div class="relative mt-1 text-6xl font-extrabold text-center text-blue-900">
    {#if code == ''}+{:else}{code}{/if}
    {#if leaders}
      <HabitCardInfoLeader short={true} text={leaders[1]} />
    {/if}
  </div>
  <div
    class="relative mt-2 text-sm font-bold text-center text-gray-500 uppercase">
    <slot />
    {#if leaders}
      <HabitCardInfoLeader short={false} text={leaders[2]} />
    {/if}
  </div>
</div>
