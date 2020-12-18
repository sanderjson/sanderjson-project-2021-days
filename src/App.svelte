<script>
  import Doodle from "./Doodle.svelte";
  import Message from "./Message.svelte";
</script>


<div class="h-screen w-screen overflow-hidden">
  <Doodle />
</div>

<Message />

<svelte:head>
  <script defer src="https://unpkg.com/css-doodle@0.8.5/css-doodle.min.js">

  </script>
</svelte:head>
