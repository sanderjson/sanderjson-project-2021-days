<script>
	import ContentWrapper from "../components/ContentWrapper.svelte";
	import AppHeader from "../components/AppHeader.svelte";
	import TwentyTwentyOne from "../svg/2021.svelte";

	import { push } from "svelte-spa-router";
	import { onMount } from "svelte";
	import {
		errMessage,
		API_ENDPOINT,
		isLocalStorage,
		userAuth,
		userId,
		userProfile,
		userHabitsActive,
		userHabitsHistory,
		isLSDataOutdated,
	} from "../stores.js";
	import {
		LSisUserDefined,
		LSuserAuth,
		LSuserProfile,
		LSuserHabitsActive,
		LSuserHabitsHistory,
	} from "../localStorage.js";

	let userTemp = {
		email: "",
		password: "",
	};

	const handleSignIn = async () => {
		const fetchURL = $API_ENDPOINT + "/_login";

		const fetchOptions = {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				email: userTemp.email.toLocaleLowerCase(),
				password: userTemp.password,
			}),
		};

		const handleErrors = (res) => {
			if (!res.ok) {
				return res.text().then((text) => {
					throw text;
				});
			}
			return res.json();
		};

		const postData = await fetch(fetchURL, fetchOptions)
			.then(handleErrors)
			.then((res) => {
				// console.log("res", res);
				userAuth.set(res.userAuth);
				userProfile.set(res.userProfile);
				userId.set(res.userProfile.adminIdUser);
				let tempHabitsActive = res.userHabitsActive;
				let tempHabitsActiveClean = [{}, {}, {}];
				for (const habit of tempHabitsActive) {
					tempHabitsActiveClean[habit.adminActivePosition] = habit;
				}
				userHabitsActive.set(tempHabitsActiveClean);
				userHabitsHistory.set(res.userHabitsHistory);
				isLSDataOutdated.set(true);
			})
			.catch((err) => {
				// console.clear();
				errMessage.set(err);
				push(`/error`);
			});
	};

	onMount(() => {
		// clean all local storage on start screen
		if ($isLocalStorage) {
			LSuserAuth.set(null);
			LSuserProfile.set(null);
			LSuserHabitsActive.set([null, null, null]);
			LSuserHabitsHistory.set([]);
			LSisUserDefined.set(false);
		}
	});
</script>

<AppHeader>
	<TwentyTwentyOne />
</AppHeader>

<ContentWrapper>
	<div>
		<form class="space-y-6" on:submit|preventDefault={handleSignIn}>
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700">
					Email address
				</label>
				<div class="mt-1">
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						bind:value={userTemp.email}
						class="appearance-none block w-full px-3 py-2 border border-gray-300
            rounded-md shadow-sm placeholder-gray-400 focus:outline-none
            focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					/>
				</div>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700">
					Password
				</label>
				<div class="mt-1">
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="password"
						required
						bind:value={userTemp.password}
						class="appearance-none block w-full px-3 py-2 border border-gray-300
            rounded-md shadow-sm placeholder-gray-400 focus:outline-none
            focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					/>
				</div>
			</div>

			<div>
				<button
					type="submit"
					class="w-full flex justify-center py-2 px-4 border border-transparent
          rounded-md shadow-sm text-sm font-bold text-white bg-blue-900
          hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2
          focus:ring-blue-500"
				>
					Sign In
				</button>
			</div>
		</form>

		<div class="mt-6">
			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300" />
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-2 bg-white text-gray-500">Or</span>
				</div>
			</div>

			<div class="mt-6 grid grid-cols-2 gap-3">
				<div>
					<a
						href="#/signup"
						class="w-full inline-flex justify-center py-2 px-4 border
            border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium
            text-gray-500 hover:bg-gray-50"
					>
						<span class="">Sign Up</span>
					</a>
				</div>
				<div>
					<a
						href="#/about"
						class="w-full inline-flex justify-center py-2 px-4 border
            border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium
            text-gray-500 hover:bg-gray-50"
					>
						<span class="">About</span>
					</a>
				</div>
			</div>
		</div>
	</div>
</ContentWrapper>
