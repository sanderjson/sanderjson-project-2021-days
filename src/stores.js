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
	{ disabled: false, value: 60, text: `1 min` },
	{ disabled: false, value: 300, text: `5 min` },
	{ disabled: false, value: 60 * 15, text: "15 min" },
	{ disabled: false, value: 3600 * 1, text: "1 hour" },
	{ disabled: false, value: 3600 * 8, text: "8 hours" },
	{ disabled: false, value: 3600 * 24, text: "24 hours" },
	{ disabled: false, value: 3600 * 24 * 3, text: "3 days" },
	{ disabled: false, value: 3600 * 24 * 7, text: "7 days" },
	{ disabled: true, value: 3600 * 24 * 21, text: "21 days" },
	{ disabled: true, value: 3600 * 24 * 100, text: "100 days" },
	{ disabled: true, value: 3600 * 24 * 365, text: "1 year" },
];

const contentHabitCheckinFrequencyData = [
	{ disabled: false, value: 20, text: `20 sec` },
	{ disabled: false, value: 60 * 15, text: "15 min" },
	{ disabled: false, value: 3600 * 1, text: "1 hour" },
	{ disabled: false, value: 3600 * 2, text: "2 hours" },
	{ disabled: false, value: 3600 * 3, text: "3 hours" },
	{ disabled: false, value: 3600 * 8, text: "8 hours" },
	{ disabled: false, value: 3600 * 12, text: "12 hours" },
	{ disabled: false, value: 3600 * 24, text: "1 day" },
	{ disabled: true, value: 3600 * 24 * 3, text: "3 days" },
	{ disabled: true, value: 3600 * 24 * 7, text: "7 days" },
	{ disabled: true, value: 3600 * 24 * 21, text: "21 days" },
	{ disabled: true, value: 3600 * 24 * 100, text: "100 days" },
	{ disabled: true, value: 3600 * 24 * 365, text: "1 year" },
];

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
		adminIdHabit: null,
		adminIdSeries: null,
		adminIdUser: null,
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
		detailCheckinFrequency: 0,
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

const userAuthData = {
	prop1: null,
	prop2: null,
	prop3: null,
};

const userProfileData = getUserProfileBlankFun();
const userHabitsActiveData = [null, null, null];
const userHabitsHistoryData = [];

export const contentHabitDetailCategory = readable(
	contentHabitDetailCategoryData
);
export const contentHabitDuration = readable(contentHabitDurationData);
export const contentHabitCheckinFrequency = readable(
	contentHabitCheckinFrequencyData
);

export const userId = writable(null);
export const userAuth = writable(userAuthData);
export const userProfile = writable(userProfileData);
export const userHabitsActive = writable(userHabitsActiveData);
export const userHabitsHistory = writable(userHabitsHistoryData);

export const indexActiveHabit = writable(0);

export const isNewSocialModal = writable(false);
export const isNewHabitCheckModal = writable(false);
export const isReadyToHabitCheck = writable(false);

export const isLSDataOutdated = writable(false);
export const isDataOutdatedHistory = writable(false);
export const isDataOutdatedUserDelete = writable(false);

export const isLocalStorage = writable(null);
export const isObjectEmpty = readable(isObjectEmptyFun);

export const getUserProfileBlank = readable(getUserProfileBlankFun);
export const getUserHabitBlank = readable(getUserHabitBlankFun);
export const getIsLocalStorage = readable(isLocalStorageFun);

export const errMessage = writable(null);
export const API_ENDPOINT = readable(
	"https://sanderjson-pr-2021-days.builtwithdark.com"
);
