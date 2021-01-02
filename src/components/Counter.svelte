<script>
  import Zero from "../assets/zero.svelte";
  import One from "../assets/one.svelte";
  import Two from "../assets/two.svelte";
  import Three from "../assets/three.svelte";
  import Four from "../assets/four.svelte";
  import Five from "../assets/five.svelte";
  import Six from "../assets/six.svelte";
  import Seven from "../assets/seven.svelte";
  import Eight from "../assets/eight.svelte";
  import Nine from "../assets/nine.svelte";

  export let digits;
</script>

<!-- first -->
{#if digits.first == '0'}
  <Zero />
{:else if digits.first == '1'}
  <One />
{:else if digits.first == '2'}
  <Two />
{:else if digits.first == '3'}
  <Three />
{:else if digits.first == '4'}
  <Four />
{:else if digits.first == '5'}
  <Five />
{:else if digits.first == '6'}
  <Six />
{:else if digits.first == '7'}
  <Seven />
{:else if digits.first == '8'}
  <Eight />
{:else if digits.first == '9'}
  <Nine />
{/if}
<!-- second -->
{#if digits.second == '0'}
  <Zero />
{:else if digits.second == '1'}
  <One />
{:else if digits.second == '2'}
  <Two />
{:else if digits.second == '3'}
  <Three />
{:else if digits.second == '4'}
  <Four />
{:else if digits.second == '5'}
  <Five />
{:else if digits.second == '6'}
  <Six />
{:else if digits.second == '7'}
  <Seven />
{:else if digits.second == '8'}
  <Eight />
{:else if digits.second == '9'}
  <Nine />
{/if}
