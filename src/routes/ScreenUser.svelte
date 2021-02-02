<script>
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AppHeader from "../components/AppHeader.svelte";
  import Counter from "../components/Counter.svelte";
  import { userProfile } from "../stores.js";

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
    $userProfile.habitDateStartUTCString
  ).getTime();
  let dateEnd = new Date($userProfile.habitDateEndUTCString).getTime();
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
      Hey {$userProfile.name}!
    </p>
    <p class="text-sm font-medium text-gray-500 ">
      You have challenged yourself to {$userProfile.habitType ? 'start' : 'kick'}
      {$userProfile.habit}. You made this decision here {$userProfile.habitDateStartUTCString}.
    </p>
    <p class="text-sm font-medium text-gray-500 ">
      By {$userProfile.habitDateEndUTCString} you will have achieved your
      twenty-one day goal.
    </p>
    <div class="text-center text-gray-300">{updateTime} seconds</div>
  </div>
</ContentWrapper>
