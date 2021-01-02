<script>
  import Doodle from "../Doodle.svelte";
  import { push, pop, replace } from "svelte-spa-router";
  import { onMount } from "svelte";
  import { tempIsUserDefined, tempUserDetails } from "../stores.js";
  import {
    LSisUserDefined,
    LSuserAuth,
    LSuserDetails
  } from "../localStorage.js";

  export let params;

  let dateStart;
  let diff;
  let daysIn;
  let dateEnd;
  let dateCurrent;
  let activeUserDetails = {
    name: "",
    habit: "",
    habitType: null,
    habitCategory: [],
    habitDateStartUTCString: "",
    habitDateEndUTCString: ""
  };

  onMount(() => {
    if ($LSisUserDefined) {
      activeUserDetails = $LSuserDetails;
      // console.log("local storage user active");
    } else if ($tempIsUserDefined) {
      activeUserDetails = $tempUserDetails;
      // console.log("temporary user active");
    } else {
      // console.log("no user defined directing to /#start");
      push("/start");
    }

    dateEnd = new Date(activeUserDetails.habitDateEndUTCString).getTime();
    dateCurrent = new Date().getTime();

    const calTimeLeft = () => {
      let diff = dateEnd - dateCurrent;
      return diff;
    };

    const calDaysIn = (dateStart, dateToday) => {
      let diff = dateToday - dateStart;
      return (diff / 1000 / 3600 / 24).toFixed(0) + 1;
    };

    const getDates = () => {
      dateStart = new Date(activeUserDetails.habitDateStartUTCString).getTime();
      daysIn = calDaysIn(dateStart, dateCurrent);
    };

    getDates();
  });

  let counter = new Date().getTime();
  const update = setInterval(() => {
    counter++;
  }, 1000);

  let updateTime = dateEnd - counter;
  $: updateTime = dateEnd - counter;
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
      <div class="text-center text-gray-400">{updateTime} seconds</div>
      <h1 class="text-base sm:text-3xl font-bold pt-3">
        Hey {activeUserDetails.name}!
      </h1>
      <p class="text-sm sm:text-2xl text-gray-500 pt-1 sm:pt-2">
        You have challenged yourself to {activeUserDetails.habitType ? 'start' : 'kick'}
        the habit of {activeUserDetails.habit}.
      </p>
      <p class="text-sm sm:text-2xl text-gray-500 pt-1 sm:pt-2">
        <a
          href="https://yourknow.com/uploads/books/How_Long_Does_it_Take_to_Form_a_Habit__Backed_by_Science_.pdf"
          target="_blank">
          Research
        </a>
        suggests it takes 21 days to {activeUserDetails.habitType ? 'start' : 'kick'}
        any habit. By {activeUserDetails.habitDateEndUTCString} you will have
        achieved your goal.
      </p>
    </section>
  </div>
</div>

<svelte:head>
  <script defer src="https://unpkg.com/css-doodle@0.8.5/css-doodle.min.js">

  </script>
</svelte:head>
