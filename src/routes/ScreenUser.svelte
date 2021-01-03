<script>
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AppHeader from "../components/AppHeader.svelte";
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
    diff = (diff / 1000 / 3600 / 24 + 1).toFixed(0);
    diff = diff.toString().split("");
    // console.log("diff", diff);
    if (diff.length == 1) {
      return { first: 0, second: diff[0] };
    } else {
      return { first: diff[0], second: diff[1] };
    }
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
  <AppHeader>
    <Counter digits={daysIn} />
  </AppHeader>

  <ContentWrapper>
    <div class="space-y-6">
      <div class="text-sm font-bold text-gray-700">
        Hey {$activeUserDetails.name}!
      </div>
      <p class="text-sm font-medium text-gray-500 ">
        You have challenged yourself to {$activeUserDetails.habitType ? 'start' : 'kick'}
        {$activeUserDetails.habit}. You made this decision here {$activeUserDetails.habitDateStartUTCString}.
      </p>
      <p class="text-sm font-medium text-gray-500 ">
        By {$activeUserDetails.habitDateEndUTCString} you will have achieved
        your twenty-one day goal.
      </p>
      <div class="mt-2 text-center text-gray-300">{updateTime} seconds</div>

    </div>
  </ContentWrapper>

</div>

<svelte:head>
  <script defer src="https://unpkg.com/css-doodle@0.8.5/css-doodle.min.js">

  </script>
</svelte:head>
