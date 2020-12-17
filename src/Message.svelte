<script>
  let quitStart = new Date(2020, 11, 12);
  let today = new Date();
  let todayFixed = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  console.log(todayFixed);
  // let todayYear = today.getFullYear();
  // let todayMonth = today.getMonth() + 1;

  let quitTime = todayFixed - quitStart;
  let quitDay = (quitTime / 1000 / 3600 / 24).toFixed(0);
</script>

<style>

</style>

<div class="absolute inset-0 flex justify-center items-center">
  <div class="container m-8 bg-white rounded-lg shadow-xl max-w-screen-sm transition-all duration-150">
    <section class="py-6 px-4 sm:py-10 sm:px-8">
      <div
        class="text-2xl sm:text-5xl text-gray-500 text-center uppercase
        leading-none m-0 p-0">
        day
      </div>
      <div
        class="text-9xl sm:text-12xl font-bold text-center leading-none m-0 p-0">
        {quitDay}
      </div>
      <h1 class="text-base sm:text-3xl font-bold pt-3">Hey Cassy!</h1>
      <p class="text-sm sm:text-2xl text-gray-500 pt-1">
        You said it takes 21 days to make or break a habit. On January 4, 2021
        you will have quit smoking. We all know you can do anything you put your
        mind to.
      </p>
    </section>
  </div>
</div>
