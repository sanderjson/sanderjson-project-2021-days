<script>
  import Doodle from "../Doodle.svelte";
  import { push, pop, replace } from "svelte-spa-router";
  import { activeUser, isSignedIn } from "../stores.js";
  import { onMount } from "svelte";

  export let params;
  let currentDate, startDate, diff, daysIn;
  // const getQuitStart = () => {
  //   // Date(year, month, day)
  //   return new Date(2020, 11, 13);
  // };

  // const calDateEnd = startDate => {
  //   return new Date(
  //     startDate.getFullYear(),
  //     startDate.getMonth(),
  //     startDate.getDate() + 21 - 1
  //   );
  // };

  // const getDateToday = () => {
  //   let today = new Date();
  //   return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  // };

  const calDaysIn = (dateStart, dateToday) => {
    let diff = dateToday - dateStart;
    console.log("diff", diff);
    return (diff / 1000 / 3600 / 24).toFixed(0) + 1;
  };

  // const formatDate = date => {
  //   const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
  //   const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
  //   const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
  //   return `${mo} ${da}, ${ye}`;
  // };

  // let quitStart = getQuitStart();
  // let quitEnd = calDateEnd(quitStart);
  // let quitEndString = formatDate(quitEnd);
  // let today = getDateToday();
  // let daysIn = calDaysIn(
  //   $activeUser.habitDateStartUTCString,
  //   currentDate.toUTCString()
  // );

  const getDates = () => {
    currentDate = new Date().getTime();
    startDate = new Date($activeUser.habitDateStartUTCString).getTime();

    console.log("currentDate", currentDate);
    console.log("startDate", startDate);

    daysIn = calDaysIn(startDate, currentDate);
  };

  onMount(() => {
    if (!$isSignedIn || $activeUser.email == null) {
      replace(`/`);
    }

    getDates();
  });
</script>

<style>

</style>

<div class="h-screen w-screen overflow-hidden">
  <Doodle />
</div>

<div class="absolute inset-0 flex justify-center items-center">
  <div
    class="container my-8 mx-16 bg-white rounded-lg shadow-xl max-w-screen-sm
    transition-all duration-150">
    <section class="py-8 px-4 sm:py-10 sm:px-8">
      <div
        class="text-2xl sm:text-5xl text-gray-500 text-center uppercase
        leading-none">
        day
      </div>
      <div
        class="text-9xl sm:text-12xl font-bold text-center leading-none m-0 p-0">
        {daysIn}
      </div>
      <h1 class="text-base sm:text-3xl font-bold pt-3">
        Hey {$activeUser.name}!
      </h1>
      <p class="text-sm sm:text-2xl text-gray-500 pt-1 sm:pt-2">
        You said it takes 21 days to make or break a habit. On {$activeUser.habitDateEndUTCString}
        you will have {$activeUser.habit}. We all know you can do anything you
        put your mind to.
      </p>
    </section>
  </div>
</div>

<svelte:head>
  <script defer src="https://unpkg.com/css-doodle@0.8.5/css-doodle.min.js">

  </script>
</svelte:head>
