<script>
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AppHeader from "../components/AppHeader.svelte";
  import Error from "../assets/error.svelte";
  import { errMessage } from "../stores.js";
</script>

<div class="flex flex-col justify-center py-12 sm:px-6 lg:px-8">

  <AppHeader>
    <Error />
  </AppHeader>

  <ContentWrapper>
    <div>Error: {$errMessage}</div>
    <a href="/#/start">Click here</a>
  </ContentWrapper>

</div>
