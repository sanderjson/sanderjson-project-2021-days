import { readable, writable } from "svelte/store";

const contentHabitDetailCategoryData = [
	{
		title: "Physical Habit",
		label: "physical",
		content:
			"Walking, running, exercise, improved posture, quit smoking, stop biting nails.",
	},
	{
		title: "Learning Habit",
		label: "learning",
		content:
			"Taking a new course, reading, learning a new skill, unlearn limiting beliefs.",
	},
	{
		title: "Social Habit",
		label: "social",
		content:
			"Calling friends or family, meeting new people, being more open, stop toxic patterns.",
	},
];

const contentHabitDurationData = [
	{ disabled: false, value: 3600, text: `1 hour` },
	{ disabled: false, value: 3600 * 24, text: `24 hours` },
	{ disabled: false, value: 3600 * 24 * 3, text: `3 days` },
	{ disabled: true, value: 3600 * 24 * 7, text: `7 days` },
	{ disabled: true, value: 3600 * 24 * 21, text: `21 days` },
	{ disabled: true, value: 3600 * 24 * 100, text: `100 days` },
	{ disabled: true, value: 3600 * 24 * 365, text: `1 year` },
];

// function to test if local storage is enabled
const isLocalStorageFun = () => {
	if (typeof localStorage !== "undefined") {
		try {
			localStorage.setItem("feature_test", "yes");
			if (localStorage.getItem("feature_test") === "yes") {
				localStorage.removeItem("feature_test");
				// localStorage is enabled
				return true;
			} else {
				// localStorage is disabled
				return false;
			}
		} catch (e) {
			// localStorage is disabled
			return false;
		}
	} else {
		// localStorage is not available
		return false;
	}
};

const getUserProfileBlankFun = () => {
	return {
		name: "",
		email: "",
		title: "",
		initials: "",
		password: "",
		userScore: 0,
		isAccountPrivate: true,
		socialAccounts: {},
		habitActiveIds: [null, null, null],
		habitHistoryIds: [],
		userId: null,
		podId: null,
		imageId: null,
		signUpDate: null,
	};
};

const getUserHabitBlankFun = () => {
	return {
		adminActivePosition: null,
		adminIsActive: null,
		adminUserId: null,
		adminHabitId: null,
		adminSeriesId: null,
		adminScore: 0,
		adminIsSuccessful: null,
		adminUserRating: 0,
		adminUserReflection: "",
		detailIsCategory1: false,
		detailIsCategory2: false,
		detailIsCategory3: false,
		detailCode: "",
		detailDateEndUTCString: "",
		detailDateStartUTCString: "",
		detailDuration: 0,
		detailDescription: "",
		detailIsNewHabit: true,
		detailTitle: "",
		checks: [],
		messages: [],
		reflectComment: "",
		reflectDifficulty: null,
		reflectionIsSuccessful: null,
		reflectRecommend: null,
	};
};

// content edit
export const contentHabitDetailCategory = readable(
	contentHabitDetailCategoryData
);
export const contentHabitDuration = readable(contentHabitDurationData);

export const getIsLocalStorage = readable(isLocalStorageFun);
export const isLocalStorage = writable(null);

export const errMessage = writable(null);
export const API_ENDPOINT = readable(
	"https://sanderjson-pr-2021-days.builtwithdark.com"
);

const activeUserAuthData = {
	prop1: null,
	prop2: null,
	prop3: null,
};

export const activeUserAuth = writable(activeUserAuthData);
export const isActiveUserLive = writable(false);

// temp...Data to be used if LS is not available
const tempUserDetailsData = {};
const tempActiveHabitsData = [{}, {}, {}];

// active...Data is what the app uses -> see App.svelte
const activeUserDetailsData = getUserProfileBlankFun();
const activeUserHabitsData = [null, null, null];

export const getUserProfileBlank = readable(getUserProfileBlankFun);
export const getUserHabitBlank = readable(getUserHabitBlankFun);

export const tempIsUserDefined = writable(false);
export const tempUserDetails = writable(tempUserDetailsData);
export const tempActiveHabits = writable(tempActiveHabitsData);
export const activeUserDetails = writable(activeUserDetailsData);
export const activeUserHabits = writable(activeUserHabitsData);

// for iterating over active habits
export const currentActiveHabit = writable(0);
// flag for social media
export const isNewSocialModal = writable(false);

export const activeUserId = writable(null);

// adding new habits
export const isNewActiveUserHabit = writable(false);
export const tempUserHabit = writable({});
export const isActiveHabitComplete = writable(false);
