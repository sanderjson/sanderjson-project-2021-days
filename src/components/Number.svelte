<script>
  import Zero from "../svg/zero.svelte";
  import One from "../svg/one.svelte";
  import Two from "../svg/two.svelte";
  import Three from "../svg/three.svelte";
  import Four from "../svg/four.svelte";
  import Five from "../svg/five.svelte";
  import Six from "../svg/six.svelte";
  import Seven from "../svg/seven.svelte";
  import Eight from "../svg/eight.svelte";
  import Nine from "../svg/nine.svelte";

  export let val;
</script>

{#if val == '0'}
  <Zero />
{:else if val == '1'}
  <One />
{:else if val == '2'}
  <Two />
{:else if val == '3'}
  <Three />
{:else if val == '4'}
  <Four />
{:else if val == '5'}
  <Five />
{:else if val == '6'}
  <Six />
{:else if val == '7'}
  <Seven />
{:else if val == '8'}
  <Eight />
{:else if val == '9'}
  <Nine />
{/if}
