<script>
  export let text;
  export let short;
</script>

<style>
  .leader-line {
    height: 50%;
    top: 50%;
    width: 150%;
    left: calc(100% + 0.5rem);
  }
  .leader-text {
    left: calc(254%);
  }
  .leader-line.short {
    width: 125%;
  }
  .leader-text.short {
    left: calc(229%);
  }
</style>

<span
  class="leader-line absolute text-blue-900 border-t-2 green-500"
  class:short />
<span
  class="leader-text ml-2 p-2 rounded flex justify-center items-center absolute
  top-0 bottom-0 leading-none text-xs font-extrabold text-gray-900 uppercase
  text-left"
  class:short>
  {text}
</span>
