<script>
  let quitStart = new Date(2020, 11, 12);
  let today = new Date();
  // let todayYear = today.getFullYear();
  // let todayMonth = today.getMonth() + 1;
  let quitTime = today - quitStart;
  let quitDay = (quitTime / 1000 / 3600 / 24).toFixed(0);
</script>

<style>

</style>

<div class="absolute inset-0 flex justify-center items-center">
  <div class="container m-8 bg-white rounded-lg shadow-xl">
    <section class="py-6 px-4">
      <div
        class="text-2xl text-gray-500 text-center uppercase leading-none m-0 p-0">
        day
      </div>
      <div class="text-9xl font-bold text-center leading-none m-0 p-0">
        {quitDay}
      </div>
      <h1 class="text-base pt-3">Hey Cassy!</h1>
      <p class="text-sm text-gray-500">
        You said it takes 21 days to make or break a habit. On January 4, 2021
        you will have quit smoking. We all know you can do anything you put your
        mind to.
      </p>
    </section>
  </div>
</div>
