<script>
  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";
  import {
    errMessage,
    API_ENDPOINT,
    userAuth,
    userId,
    userProfile,
    userHabitsActive,
    userHabitsHistory,
    getUserHabitBlank,
    isDataOutdatedUserDelete
  } from "../stores.js";
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AppHeaderLocalScore from "../components/AppHeaderLocalScore.svelte";
  import AppHeaderLocalTitle from "../components/AppHeaderLocalTitle.svelte";
  import FormUserEditDelete from "../components/FormUserEditDelete.svelte";
  import AppModal from "../components/AppModal.svelte";

  let tempLocalUserProfile = $userProfile;

  let contentModalDelete = {
    title: "Are You Sure You Want to Delete?",
    details:
      "You will lose all data associated with this profile. There is no way to recover the data after this point.",
    button: "Delete User Profile"
  };

  const handleModalDeleteAction = async () => {
    const fetchURL =
      $API_ENDPOINT + `/users/${tempLocalUserProfile.adminIdUser}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "content-type": "application/json"
      },

      body: JSON.stringify({
        ...tempLocalUserProfile
      })
    };

    const handleErrors = res => {
      if (!res.ok) {
        return res.text().then(text => {
          throw text;
        });
      }
      return res.json();
    };

    const postData = await fetch(fetchURL, fetchOptions)
      .then(handleErrors)
      .then(res => {
        // console.log("res", res);
        userAuth.set({
          prop1: null,
          prop2: null,
          prop3: null
        });
        userProfile.set($getUserHabitBlank());
        userId.set(null);
        userHabitsActive.set([null, null, null]);
        userHabitsHistory.set([]);
        isDataOutdatedUserDelete.set(true);
      })
      .catch(err => {
        // console.clear();
        errMessage.set(err);
        push(`/error`);
      });

    profileDeleteWarning = false;
  };

  let profileDeleteWarning = false;
  const handleDelete = () => {
    profileDeleteWarning = true;
  };

  const handleSubmitEditExistingProfile = async () => {
    const fetchURL =
      $API_ENDPOINT + `/users/${tempLocalUserProfile.adminIdUser}`;
    const fetchOptions = {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },

      body: JSON.stringify({
        ...tempLocalUserProfile
      })
    };

    const handleErrors = res => {
      if (!res.ok) {
        return res.text().then(text => {
          throw text;
        });
      }
      return res.json();
    };

    const postData = await fetch(fetchURL, fetchOptions)
      .then(handleErrors)
      .then(res => {
        // console.log("res", res);
        userProfile.set(res.userProfile);
        isDataOutdatedUserDelete.set(true);
      })
      .catch(err => {
        console.clear();
        errMessage.set(err);
        push(`/error`);
      });
  };
</script>

<ContentWrapper>
  <div>
    <AppHeaderLocalScore />
    <AppHeaderLocalTitle
      title={'Edit Account'}
      subtitle={'Fill out this form to edit'} />
    <div class="mt-6">
      <FormUserEditDelete
        {tempLocalUserProfile}
        actionTitle="Update Profile"
        handleSubmit={handleSubmitEditExistingProfile}
        altActionTitle="Delete"
        handleAltAction={handleDelete} />
    </div>
  </div>
</ContentWrapper>

{#if profileDeleteWarning}
  <AppModal contentModal={contentModalDelete}>
    <button
      on:click={handleModalDeleteAction}
      type="button"
      class="inline-flex justify-center w-full rounded-md border
      border-transparent shadow-sm px-4 py-2 bg-blue-900 text-base font-medium
      text-white hover:bg-blue-500 focus:outline-none focus:ring-2
      focus:ring-offset-2 focus:ring-blue-700 sm:text-sm">
      {contentModalDelete.button}
    </button>
  </AppModal>
{/if}
