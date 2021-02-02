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
	{ disabled: false, value: 300, text: `5 min` },
	{ disabled: false, value: 3600, text: `1 hour` },
	{ disabled: false, value: 3600 * 24, text: `24 hours` },
	{ disabled: false, value: 3600 * 24 * 3, text: `3 days` },
	{ disabled: true, value: 3600 * 24 * 7, text: `7 days` },
	{ disabled: true, value: 3600 * 24 * 21, text: `21 days` },
	{ disabled: true, value: 3600 * 24 * 100, text: `100 days` },
	{ disabled: true, value: 3600 * 24 * 365, text: `1 year` },
];

export const contentHabitDetailCategory = readable(
	contentHabitDetailCategoryData
);
export const contentHabitDuration = readable(contentHabitDurationData);

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

const isObjectEmptyFun = (obj) => {
	for (let i in obj) return false;
	return true;
};

export const getIsLocalStorage = readable(isLocalStorageFun);
export const isLocalStorage = writable(null);
export const isObjectEmpty = readable(isObjectEmptyFun);

const getUserProfileBlankFun = () => {
	return {
		adminDateCreated: null,
		adminOther: {},
		adminIdPod: null,
		adminIdUser: null,
		adminScoreUser: 0,
		detailEmail: "",
		detailImage: "",
		detailInitials: "",
		detailIsAccountPrivate: null,
		detailName: "",
		detailPassword: "",
		detailSocialAccounts: {},
		detailTitle: "",
		habitIdsActive: [],
		habitIdsHistory: [],
	};
};

const getUserHabitBlankFun = () => {
	return {
		adminActivePosition: null,
		adminDateEndUTCString: "",
		adminDateStartUTCString: "",
		adminIdUser: null,
		adminIdHabit: null,
		adminIdSeries: null,
		adminIsActive: null,
		adminScore: 0,
		detailCategory: {
			isCategory1: false,
			isCategory2: false,
			isCategory3: false,
		},
		detailCode: "",
		detailDescription: "",
		detailDuration: 0,
		detailIsNewHabit: "",
		detailTitle: "",
		checks: [],
		messages: [],
		reflectComment: "",
		reflectDifficulty: null,
		reflectIsSuccessful: null,
		reflectRating: 0,
		reflectRecommend: null,
	};
};

export const getUserProfileBlank = readable(getUserProfileBlankFun);
export const getUserHabitBlank = readable(getUserHabitBlankFun);

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
const userProfileData = getUserProfileBlankFun();
const userHabitsActiveData = [null, null, null];
const userHabitsHistoryData = [];

export const tempIsUserDefined = writable(false);
export const tempUserDetails = writable(tempUserDetailsData);
export const tempActiveHabits = writable(tempActiveHabitsData);
export const userProfile = writable(userProfileData);
export const userHabitsActive = writable(userHabitsActiveData);
export const userHabitsHistory = writable(userHabitsHistoryData);

// for iterating over active habits
export const currentActiveHabit = writable(0);
// flag for social media
export const isNewSocialModal = writable(false);

export const adminIdUser = writable(null);

// adding new habits
export const isNewActiveUserHabitChange = writable(false);
export const tempUserHabit = writable({});
export const isActiveHabitComplete = writable(false);

export const isNewDataLoaded = writable(false);
export const isHabitHistoryUpdated = writable(false);
