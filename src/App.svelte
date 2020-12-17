<script>
  import Doodle from "./Doodle.svelte";
  import Message from "./Message.svelte";

  let cssDoodle = { update: () => {} };
  $: doodle = `
		:doodle {
			@grid: 6 / 100vmax;
			height: 200px;
			width: 200px;
			
    }
@shape: circle;
		transform:
				scale(${scale}) 
				translate(@r(-5px, 5px), @r(-5px, 5px)) 
				rotate(@r(-10deg, 10deg));
		opacity: @r(.2, 1);
		background: @pick(${color}, #fff);
	`;

  $: cssDoodle.update(doodle);

  let color = "blueviolet";
  let scale = "@rand(1,2)";
</script>

<style global>
  /* purgecss start ignore */
  @tailwind base;
  @tailwind components;
  /* purgecss end ignore */
  @tailwind utilities;
</style>

<!-- <css-doodle bind:this={cssDoodle} /> -->

<Doodle />
<Message />

<svelte:head>
  <script defer src="https://unpkg.com/css-doodle@0.8.5/css-doodle.min.js">

  </script>
</svelte:head>
