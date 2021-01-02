<script>
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import Counter from "../components/Counter.svelte";

  import { push, pop, replace } from "svelte-spa-router";
  import { onMount } from "svelte";
  import { activeUserDetails } from "../stores.js";
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

  const calTimeLeft = () => {
    let diff = dateEnd - dateCurrent;
    return diff;
  };

  const calDaysIn = (dateStart, dateToday) => {
    let diff = dateToday - dateStart;
    diff = (diff / 1000 / 3600 / 24).toFixed(0) + 1;
    diff = diff.toString();
    return { first: diff[0], second: diff[1] };
  };

  dateStart = new Date($activeUserDetails.habitDateStartUTCString).getTime();
  dateEnd = new Date($activeUserDetails.habitDateEndUTCString).getTime();
  dateCurrent = new Date().getTime();
  daysIn = calDaysIn(dateStart, dateCurrent);

  let counter = new Date().getTime();
  const update = setInterval(() => {
    counter++;
  }, 1000);

  let updateTime = dateEnd - counter;
  $: updateTime = dateEnd - counter;
</script>

<div class="flex flex-col justify-center py-12 sm:px-6 lg:px-8">

  <!-- <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <div class="mx-auto w-48 sm:w-64">
      <TwentyTwentyOne />
    </div>
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
      2021 Habit Challenge
    </h2>
    <div class="mt-2 text-center text-sm text-gray-600 max-w">
      <p class="font-medium text-indigo-600 hover:text-indigo-500">
        It takes 21 days to make a habit
      </p>
    </div>
  </div> -->

  <ContentWrapper>
    <div
      class="text-2xl sm:text-5xl text-gray-500 text-center uppercase
      leading-none">
      day
    </div>
    <div class="mt-2 flex h-40 sm:h-48 lg:h-64 justify-center space-x-2">
      <Counter digits={daysIn} />
    </div>
    <div class="mt-2 text-center text-gray-400">{updateTime} seconds</div>
    <h1 class="text-base sm:text-3xl font-bold pt-3">
      Hey {$activeUserDetails.name}!
    </h1>
    <p class="text-sm sm:text-2xl text-gray-500 pt-1 sm:pt-2">
      You have challenged yourself to {$activeUserDetails.habitType ? 'start' : 'kick'}
      the habit of {$activeUserDetails.habit}.
    </p>
    <p class="text-sm sm:text-2xl text-gray-500 pt-1 sm:pt-2">
      <a
        href="https://yourknow.com/uploads/books/How_Long_Does_it_Take_to_Form_a_Habit__Backed_by_Science_.pdf"
        target="_blank">
        Research
      </a>
      suggests it takes 21 days to {$activeUserDetails.habitType ? 'start' : 'kick'}
      any habit. By {$activeUserDetails.habitDateEndUTCString} you will have
      achieved your goal.
    </p>
  </ContentWrapper>

</div>

<svelte:head>
  <script defer src="https://unpkg.com/css-doodle@0.8.5/css-doodle.min.js">

  </script>
</svelte:head>
