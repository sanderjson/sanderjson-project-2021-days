<script>
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AppHeader from "../components/AppHeader.svelte";
  import Counter from "../components/Counter.svelte";
  import { activeUserDetails } from "../stores.js";

  export let params;

  const calDaysIn = (dateStart, dateToday) => {
    let timeDiff = dateToday - dateStart;
    timeDiff = (timeDiff / 1000 / 3600 / 24 + 1).toFixed(0);
    timeDiff = timeDiff.toString().split("");
    // console.log("diff", diff);
    if (timeDiff.length == 1) {
      return { first: 0, second: timeDiff[0] };
    } else {
      return { first: timeDiff[0], second: timeDiff[1] };
    }
  };

  const update = setInterval(() => {
    dateCurrent++;
  }, 1000);

  let dateStart = new Date(
    $activeUserDetails.habitDateStartUTCString
  ).getTime();
  let dateEnd = new Date($activeUserDetails.habitDateEndUTCString).getTime();
  let dateCurrent = new Date().getTime();
  let daysIn = calDaysIn(dateStart, dateCurrent);
  let updateTime = dateEnd - dateCurrent;

  $: updateTime = dateEnd - dateCurrent;
  $: daysIn = calDaysIn(dateStart, dateCurrent);
</script>

<AppHeader>
  <Counter digits={daysIn} />
</AppHeader>

<ContentWrapper>
  <div class="space-y-6">
    <p class="text-sm font-bold text-gray-700">
      Hey {$activeUserDetails.name}!
    </p>
    <p class="text-sm font-medium text-gray-500 ">
      You have challenged yourself to {$activeUserDetails.habitType ? 'start' : 'kick'}
      {$activeUserDetails.habit}. You made this decision here {$activeUserDetails.habitDateStartUTCString}.
    </p>
    <p class="text-sm font-medium text-gray-500 ">
      By {$activeUserDetails.habitDateEndUTCString} you will have achieved your
      twenty-one day goal.
    </p>
    <div class="text-center text-gray-300">{updateTime} seconds</div>
  </div>
</ContentWrapper>
