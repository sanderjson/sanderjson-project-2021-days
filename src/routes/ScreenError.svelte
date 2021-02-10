<script>
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AppHeader from "../components/AppHeader.svelte";
  import AppButton from "../components/AppButton.svelte";

  import Error from "../svg/error.svelte";
  import { errMessage } from "../stores.js";
  import { push } from "svelte-spa-router";
</script>

<AppHeader>
  <Error />
</AppHeader>

<ContentWrapper>
  <div>
    <div class="my-6">Error: {$errMessage}</div>
    <AppButton handleFun={() => push('/start')} text="Click here" />
  </div>
</ContentWrapper>
