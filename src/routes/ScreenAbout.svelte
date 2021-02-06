<script>
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AppHeader from "../components/AppHeader.svelte";
  import TwentyTwentyOne from "../svg/2021.svelte";
</script>

<AppHeader>
  <TwentyTwentyOne />
</AppHeader>

<ContentWrapper>
  <div>
    <h1 class="text-xl text-gray-700 leading-8">
      It has been suggested that it takes twenty-one days to make or break a
      habit.
    </h1>
    <div
      class=" space-y-6 mt-6 prose prose-indigo prose-lg text-gray-500 mx-auto">
      <p>
        This simple app can help you track progress.
        <a class="underline" href="#/signup">Click here</a>
        to visit the signup page, and create an account with your details.
      </p>
      <p class="mt-2">
        It is so easy to make a New Year's resolution, and yet hard for so many
        follow through. Was it too ambitious? Not clearly stated? Or perhaps,
        there was a lack of social support?
      </p>

      <p class="mt-2">
        Whether you use this app or not. Try to set yourself a simple goal, and
        stick to it. A few examples of successful habits may be:
      </p>
      <ul class="mt-2">
        <li>"I will walk for 30 minutes every day for the next 21 days"</li>
        <li>"I will not smoke for the next 21 days"</li>
        <li>"I will practice gratitude everyday for the next 21 days</li>
      </ul>
      <p class="mt-2">
        We don't need anymore empty New Year's resolutions. People who want real
        change don't wait for a special day. Help yourself by making a real
        commitment of twenty-one days.
      </p>
    </div>

  </div>
</ContentWrapper>
