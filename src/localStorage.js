import { writable } from "svelte-persistent-store/dist/local";

const LSuserAuthData = {
	prop1: null,
	prop2: null,
	prop3: null,
};

const LSuserProfileData = {
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

const LSuserHabitsActiveData = [
	{
		prop1: 1,
	},
	{
		prop1: 1,
	},
	{
		prop1: 1,
	},
];

export const LSisUserDefined = writable("LSisUserDefined", false);
export const LSuserAuth = writable("LSuserAuth", LSuserAuthData);
export const LSuserProfile = writable("LSuserProfile", LSuserProfileData);
export const LSuserHabitsActive = writable(
	"LSuserHabitsActive",
	LSuserHabitsActiveData
);
export const LSuserHabitsHistory = writable("LSuserHabitsHistory", []);
