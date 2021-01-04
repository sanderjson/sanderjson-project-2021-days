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
  import { onMount } from "svelte";

  export let digits;

  onMount(() => {
    console.log("digits:", digits);
  });
</script>

<style>
  .svg-wrap {
    max-height: 154.9px;
  }
</style>

<div class="svg-wrap flex">
  {#if digits.first == '0' || digits.first == 'N'}
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
  {#if digits.second == '0' || digits.first == 'a'}
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
</div>
