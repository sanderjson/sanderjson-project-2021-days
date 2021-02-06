<script>
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AppHeader from "../components/AppHeader.svelte";
  import Error from "../svg/error.svelte";
  import { errMessage } from "../stores.js";
</script>

<AppHeader>
  <Error />
</AppHeader>

<ContentWrapper>
  <div>
    <div>Error: {$errMessage}</div>
    <a href="/#/start">Click here</a>
  </div>
</ContentWrapper>
